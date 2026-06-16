import { buildLeanIndex, exportIndex } from './lean-flexsearch.ts';
import type { ContentIndexer, ProcessedDoc, ProviderContext } from 'docusaurus-plugin-mcp-server';

export default class LeanFlexSearchIndexer implements ContentIndexer {
  readonly name = 'lean-flexsearch';
  private baseUrl = '';
  private docsIndex: Record<string, ProcessedDoc> = {};
  private exportedIndex: Record<string, unknown> | null = null;
  private docCount = 0;

  async initialize(context: ProviderContext): Promise<void> {
    this.baseUrl = context.baseUrl ?? '';
    this.docsIndex = {};
    this.exportedIndex = null;
    this.docCount = 0;
  }

  async indexDocuments(docs: ProcessedDoc[]): Promise<void> {
    this.docCount = docs.length;
    for (const doc of docs) {
      this.docsIndex[`${this.baseUrl}${doc.route}`] = doc;
    }
    console.log('[LeanFlexSearch] Building lean search index...');
    const index = buildLeanIndex(docs, this.baseUrl);
    this.exportedIndex = await exportIndex(index);
    console.log(`[LeanFlexSearch] Indexed ${this.docCount} documents`);
  }

  async finalize(): Promise<Map<string, unknown>> {
    const artifacts = new Map<string, unknown>();
    artifacts.set('docs.json', this.docsIndex);
    artifacts.set('search-index.json', this.exportedIndex);
    return artifacts;
  }

  async getManifestData(): Promise<Record<string, unknown>> {
    return { searchEngine: 'lean-flexsearch' };
  }
}
