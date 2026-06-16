import { importIndex, queryIndex } from './lean-flexsearch.ts';
import type {
  ProcessedDoc,
  ProviderContext,
  SearchOptions,
  SearchProvider,
  SearchProviderInitData,
  SearchResult,
} from 'docusaurus-plugin-mcp-server';

type LeanIndex = Awaited<ReturnType<typeof importIndex>>;

export default class LeanFlexSearchProvider implements SearchProvider {
  readonly name = 'lean-flexsearch';
  private docs: Record<string, ProcessedDoc> | null = null;
  private searchIndex: LeanIndex | null = null;
  private ready = false;

  async initialize(_context: ProviderContext, initData?: SearchProviderInitData): Promise<void> {
    if (!initData?.docs || !initData?.indexData) {
      throw new Error('[LeanFlexSearch] Provider requires pre-loaded docs and indexData');
    }
    this.docs = initData.docs;
    this.searchIndex = await importIndex(initData.indexData);
    this.ready = true;
  }

  isReady(): boolean {
    return this.ready && this.docs !== null && this.searchIndex !== null;
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.isReady() || !this.docs || !this.searchIndex) {
      throw new Error('[LeanFlexSearch] Not initialized');
    }
    return queryIndex(this.searchIndex, this.docs, query, { limit: options?.limit ?? 16 });
  }

  async getDocument(url: string): Promise<ProcessedDoc | null> {
    if (!this.docs) throw new Error('[LeanFlexSearch] Not initialized');
    return this.docs[url] ?? null;
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    if (!this.isReady()) return { healthy: false, message: 'not initialized' };
    return { healthy: true, message: `ready with ${this.getDocCount()} documents` };
  }

  getDocCount(): number {
    return this.docs ? Object.keys(this.docs).length : 0;
  }

  getDocs(): Record<string, ProcessedDoc> | null {
    return this.docs;
  }

  getSearchIndex(): LeanIndex | null {
    return this.searchIndex;
  }
}
