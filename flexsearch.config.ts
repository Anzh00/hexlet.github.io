import type { FlexSearchConfig } from 'docusaurus-plugin-mcp-server';

// FlexSearch tuned for Russian content. The plugin's defaults are tuned for
// English (forward tokenize + bidirectional context + English stemmer) and
// produce an 80+ MB index on our docs.
//
// - tokenize: 'strict' indexes whole words only (no prefix explosion).
// - context: false drops the bidirectional context that bloats the index.
// - resolution: 3 is enough for relevance ranking on ~100 docs.
// - encode: lowercase split on Russian punctuation, no English stemmer.
//
// This config MUST be identical at build time (docusaurus.config.ts) and at
// runtime (worker/index.ts) — otherwise the runtime provider deserializes the
// index with the wrong shape and returns no results.
const flexsearchConfig: FlexSearchConfig = {
  tokenize: 'strict',
  resolution: 3,
  context: false,
  cache: 100,
  encode: (str: string) =>
    String(str)
      .toLowerCase()
      .split(/[\s\-_.,;:!?'"()[\]{}«»—–]+/)
      .filter(Boolean),
};

export default flexsearchConfig;
