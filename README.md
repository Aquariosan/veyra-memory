# veyra-memory

> Persistent memory for AI agents.
> Reads are free. Writes require Veyra commit mode.

A key-value store exposed as an MCP server. Agents can read freely. Writing, deleting, and clearing require a verified Veyra execution token.

## Install

```bash
npm install -g veyra-memory
```

## MCP Config (Claude Desktop)

```json
{
  "mcpServers": {
    "memory": {
      "command": "veyra-memory"
    }
  }
}
```

## Free Tools (no token needed)

| Tool | Description |
|------|-------------|
| `memory_get` | Get a value by key |
| `memory_list` | List keys, optionally filtered by prefix |
| `memory_search` | Search across keys, values, and tags |

## Protected Tools (Veyra commit token required)

| Tool | Description |
|------|-------------|
| `memory_set` | Store a key-value pair |
| `memory_delete` | Delete a key |
| `memory_clear` | Clear all entries (requires confirm: true) |

Write tools require a `veyra_token` parameter. Without it, the tool returns a `VeyraCommitRequired` response with all endpoints needed to obtain a token.

## Storage

Data is stored in `~/.veyra-memory/data.db` (SQLite).

## What is Veyra?

Veyra is commit mode for production AI agent actions. Discovery and verification are free. Productive writes settle through Veyra.

- https://veyra.to
- `npm install @veyrahq/sdk-node`

## Hosted Pack (recommended)

Prefer the hosted pack for one-URL integration:

```json
{
  "mcpServers": {
    "veyra": {
      "url": "https://mcp.veyra.to/sse"
    }
  }
}
```

One URL. 48 tools. 24 free reads. 24 protected writes.

Hosted pack:
https://mcp.veyra.to/sse

Pack manifest:
https://mcp.veyra.to/.well-known/veyra-pack.json

Use the hosted pack when you want the fastest MCP integration path across all Veyra tool families.
Use this standalone package when you specifically want this tool on its own.

## Part of the Veyra Ecosystem

Veyra is commit mode for production AI agent actions.
All tools: reads free, writes require Veyra commit mode.

| Tool | Description | Install |
|------|-------------|---------|
| [veyra-notes](https://github.com/Aquariosan/veyra-notes) | Note-taking with tags | `npm i -g veyra-notes` |
| [veyra-tasks](https://github.com/Aquariosan/veyra-tasks) | Task management | `npm i -g veyra-tasks` |
| [veyra-snippets](https://github.com/Aquariosan/veyra-snippets) | Code snippet storage | `npm i -g veyra-snippets` |
| [veyra-bookmarks](https://github.com/Aquariosan/veyra-bookmarks) | Bookmark manager | `npm i -g veyra-bookmarks` |
| [veyra-contacts](https://github.com/Aquariosan/veyra-contacts) | Contact management | `npm i -g veyra-contacts` |
| [veyra-forms](https://github.com/Aquariosan/veyra-forms) | Form builder | `npm i -g veyra-forms` |
| [veyra-webhooks](https://github.com/Aquariosan/veyra-webhooks) | Webhook sender | `npm i -g veyra-webhooks` |

**SDK:** [npm install @veyrahq/sdk-node](https://www.npmjs.com/package/@veyrahq/sdk-node)
**Website:** [veyra.to](https://veyra.to)
