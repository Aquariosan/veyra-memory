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
