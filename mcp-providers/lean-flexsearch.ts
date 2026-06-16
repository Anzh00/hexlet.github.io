import FlexSearch from 'flexsearch';
import type { ProcessedDoc, SearchResult } from 'docusaurus-plugin-mcp-server';

const FIELD_WEIGHTS: Record<string, number> = {
  title: 3,
  headings: 2,
  description: 1.5,
  content: 1,
};

// Lean FlexSearch config for Russian text:
// - tokenize: "strict" indexes whole words only (no prefix explosion).
// - no `context` (the default plugin uses bidirectional context depth 2,
//   which is the main source of the 80+ MB index bloat).
// - low `resolution` is enough for relevance ranking on ~100 docs.
// - lowercase-only encode; no English stemmer.
export function createLeanIndex() {
  return new (FlexSearch as unknown as { Document: new (opts: unknown) => LeanIndex }).Document({
    tokenize: 'strict',
    cache: 100,
    resolution: 3,
    encode: (str: string) =>
      String(str)
        .toLowerCase()
        .split(/[\s\-_.,;:!?'"()[\]{}«»—–]+/)
        .filter(Boolean),
    document: {
      id: 'id',
      index: ['title', 'content', 'headings', 'description'],
      store: ['title', 'description'],
    },
  });
}

interface LeanIndex {
  add(doc: Record<string, unknown>): void;
  search(query: string, opts: { limit: number; enrich: boolean }): FlexFieldResult[];
  export(fn: (key: string, value: unknown) => void): Promise<void>;
  import(key: string, value: unknown): Promise<void>;
}

interface FlexFieldResult {
  field: string;
  result: Array<string | { id: string }>;
}

export function addDocumentToIndex(index: LeanIndex, doc: ProcessedDoc, baseUrl: string): void {
  const id = baseUrl ? `${baseUrl.replace(/\/$/, '')}${doc.route}` : doc.route;
  index.add({
    id,
    title: doc.title,
    content: doc.markdown,
    headings: doc.headings.map((h) => h.text).join(' '),
    description: doc.description,
  });
}

export function buildLeanIndex(docs: ProcessedDoc[], baseUrl: string): LeanIndex {
  const index = createLeanIndex();
  for (const doc of docs) {
    addDocumentToIndex(index, doc, baseUrl);
  }
  return index;
}

export async function exportIndex(index: LeanIndex): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {};
  await index.export((key, value) => {
    data[key] = value;
  });
  return data;
}

export async function importIndex(data: Record<string, unknown>): Promise<LeanIndex> {
  const index = createLeanIndex();
  for (const [key, value] of Object.entries(data)) {
    await index.import(key, value);
  }
  return index;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generateSnippet(markdown: string, query: string): string {
  const maxLength = 200;
  if (!markdown) return '';
  const normalized = markdown.replace(/\s+/g, ' ').trim();
  const lower = normalized.toLowerCase();
  const term = query.split(/\s+/).find(Boolean)?.toLowerCase() ?? '';
  const idx = term ? lower.indexOf(term) : -1;
  if (idx === -1) {
    return normalized.slice(0, maxLength) + (normalized.length > maxLength ? '...' : '');
  }
  const start = Math.max(0, idx - 60);
  const end = Math.min(normalized.length, idx + 140);
  return (
    (start > 0 ? '...' : '') +
    normalized.slice(start, end) +
    (end < normalized.length ? '...' : '')
  );
}

function findMatchingHeadings(doc: ProcessedDoc, query: string): string[] {
  // The plugin's tool template renders matchingHeadings via `.join(", ")`,
  // so we return plain strings to avoid "[object Object]" output.
  if (!doc.headings || !query) return [];
  const re = new RegExp(escapeRegExp(query), 'i');
  return doc.headings
    .filter((h) => re.test(h.text))
    .slice(0, 3)
    .map((h) => h.text);
}

export function queryIndex(
  index: LeanIndex,
  docs: Record<string, ProcessedDoc>,
  query: string,
  options: { limit?: number } = {},
): SearchResult[] {
  const { limit = 16 } = options;
  const rawResults = index.search(query, { limit: limit * 3, enrich: true });
  const docScores = new Map<string, number>();
  for (const fieldResult of rawResults) {
    const weight = FIELD_WEIGHTS[fieldResult.field] ?? 1;
    const results = fieldResult.result;
    for (let i = 0; i < results.length; i += 1) {
      const item = results[i];
      if (!item) continue;
      const docId = typeof item === 'string' ? item : item.id;
      const positionScore = (results.length - i) / results.length;
      docScores.set(docId, (docScores.get(docId) ?? 0) + positionScore * weight);
    }
  }
  const results: SearchResult[] = [];
  for (const [docId, score] of docScores) {
    const doc = docs[docId];
    if (!doc) continue;
    results.push({
      url: docId,
      route: doc.route,
      title: doc.title,
      score,
      snippet: generateSnippet(doc.markdown, query),
      // SearchResult.matchingHeadings is typed as DocHeading[]; we return
      // strings on purpose (see findMatchingHeadings above).
      matchingHeadings: findMatchingHeadings(doc, query) as unknown as SearchResult['matchingHeadings'],
    });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
