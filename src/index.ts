#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as store from "./store.js";
import { requireVeyra } from "./veyra.js";

const server = new McpServer({
  name: "veyra-memory",
  version: "1.0.0",
});

// ── Structured error response for MCP clients ──

function commitRequiredResponse(error: Record<string, unknown>) {
  const e = error as {
    error: string;
    message: string;
    currentMode: string;
    requiredMode: string;
    authorize_endpoint: string;
    verify_endpoint: string;
    install: string;
    retry_strategy: string;
    [key: string]: unknown;
  };

  // Human-readable summary as first content block
  const summary = [
    `⛔ ${e.error}`,
    ``,
    e.message,
    ``,
    `Current mode:  ${e.currentMode}`,
    `Required mode: ${e.requiredMode}`,
    ``,
    `To proceed:`,
    `1. Obtain a token: POST ${e.authorize_endpoint}`,
    `2. Retry this tool with veyra_token parameter`,
    ``,
    `After execution, complete the settlement flow:`,
    `3. Submit receipt: POST ${e.receipt_endpoint ?? "…/v1/submit-receipt"}`,
    `4. Settle action:  POST ${e.settle_endpoint ?? "…/v1/settle-action"}`,
    ``,
    `SDK: ${e.install}`,
    `Docs: ${(e.docs_url as string) ?? "https://veyra.to"}`,
  ].join("\n");

  return {
    isError: true,
    content: [
      { type: "text" as const, text: summary },
      { type: "text" as const, text: JSON.stringify(error, null, 2) },
    ],
  };
}

function successResponse(data: object) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

// ── Read tools (free, no Veyra) ──

server.tool(
  "memory_get",
  "Get a value by key from persistent memory",
  { key: z.string().describe("Key to look up") },
  async ({ key }) => {
    const entry = store.get(key);
    if (!entry) {
      return { content: [{ type: "text", text: `Key "${key}" not found.` }] };
    }
    return successResponse(entry);
  }
);

server.tool(
  "memory_list",
  "List keys in persistent memory, optionally filtered by prefix",
  {
    prefix: z.string().optional().describe("Key prefix filter"),
    limit: z.number().optional().describe("Max results (default 50)"),
  },
  async ({ prefix, limit }) => {
    const entries = store.list(prefix, limit);
    return {
      content: [{ type: "text", text: JSON.stringify(entries, null, 2) }],
    };
  }
);

server.tool(
  "memory_search",
  "Search memory by keyword across keys, values, and tags",
  { query: z.string().describe("Search keyword") },
  async ({ query }) => {
    const results = store.search(query);
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  }
);

// ── Write tools (Veyra commit mode required) ──

server.tool(
  "memory_set",
  "Store a key-value pair in persistent memory. Requires a Veyra execution token (veyra_token). Without it, returns VeyraCommitRequired with instructions to obtain one.",
  {
    key: z.string().describe("Key to store"),
    value: z.string().describe("Value to store"),
    tags: z.string().optional().describe("Comma-separated tags"),
    veyra_token: z.string().optional().describe("Veyra execution token for commit mode"),
  },
  async ({ key, value, tags, veyra_token }) => {
    const check = await requireVeyra(veyra_token);
    if (!check.ok) return commitRequiredResponse(check.error);

    store.set(key, value, tags);
    return successResponse({
      stored: true,
      key,
      committed: true,
      mode: "commit",
    });
  }
);

server.tool(
  "memory_delete",
  "Delete a key from persistent memory. Requires a Veyra execution token (veyra_token).",
  {
    key: z.string().describe("Key to delete"),
    veyra_token: z.string().optional().describe("Veyra execution token for commit mode"),
  },
  async ({ key, veyra_token }) => {
    const check = await requireVeyra(veyra_token);
    if (!check.ok) return commitRequiredResponse(check.error);

    const deleted = store.del(key);
    return successResponse({
      deleted: deleted > 0,
      key,
      committed: true,
    });
  }
);

server.tool(
  "memory_clear",
  "Clear all entries from persistent memory. Requires confirm: true and a Veyra execution token (veyra_token).",
  {
    confirm: z.boolean().describe("Must be true to confirm"),
    veyra_token: z.string().optional().describe("Veyra execution token for commit mode"),
  },
  async ({ confirm, veyra_token }) => {
    if (!confirm) {
      return {
        content: [
          { type: "text" as const, text: "Confirmation required. Set confirm: true." },
        ],
      };
    }
    const check = await requireVeyra(veyra_token);
    if (!check.ok) return commitRequiredResponse(check.error);

    const count = store.clear();
    return successResponse({
      cleared: true,
      entries_removed: count,
      committed: true,
    });
  }
);

// ── Start ──

const transport = new StdioServerTransport();
await server.connect(transport);
