import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { McpDocsServer } from 'docusaurus-plugin-mcp-server';
import docs from '../build/mcp/docs.json';
import searchIndex from '../build/mcp/search-index.json';
import LeanFlexSearchProvider from '../mcp-providers/lean-provider.ts';

const NAME = 'hexlet-help';
const VERSION = '1.0.0';
const BASE_URL = 'https://help.hexlet.io';

// McpDocsServer.searchProvider is normally resolved via loadSearchProvider(),
// which uses dynamic import() — won't work in a Worker bundle. We monkey-patch
// the prototype to inject our pre-imported LeanFlexSearchProvider instead.
//
// Replace this whole block with `search: new LeanFlexSearchProvider()` in the
// McpDocsServer config once this PR is released:
// https://github.com/scalvert/docusaurus-plugin-mcp-server/pull/78
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(McpDocsServer.prototype as any)._doInitialize = async function () {
  const provider = new LeanFlexSearchProvider();
  await provider.initialize(
    {
      baseUrl: this.config.baseUrl ?? '',
      serverName: this.config.name,
      serverVersion: this.config.version ?? '1.0.0',
      outputDir: '',
    },
    { docs: this.config.docs, indexData: this.config.searchIndexData },
  );
  this.searchProvider = provider;
  this.initialized = true;
};

let server: McpDocsServer | null = null;
const getServer = (): McpDocsServer =>
  (server ??= new McpDocsServer({
    docs: docs as Record<string, unknown>,
    searchIndexData: searchIndex,
    name: NAME,
    version: VERSION,
    baseUrl: BASE_URL,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any));

const app = new Hono();

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Mcp-Session-Id'],
  }),
);

// The Cloudflare route is `help.hexlet.io/mcp*`, so the Worker receives
// requests with pathname `/mcp` (or `/mcp/...`). Match all paths under
// the mount point so we don't depend on a trailing slash.
const mcp = app.basePath('/mcp');
mcp.get('/', async (c) => c.json(await getServer().getStatus()));
mcp.post('/', async (c) => getServer().handleWebRequest(c.req.raw));

app.onError((err, c) => {
  console.error('MCP Server Error:', err);
  return c.json(
    { jsonrpc: '2.0', id: null, error: { code: -32603, message: 'Internal server error' } },
    500,
  );
});

export default app;
