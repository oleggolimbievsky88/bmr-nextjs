# MCP Server Quick Start

## Quick Setup for Chrome DevTools

### 1. Start the MCP Server

```bash
pnpm run mcp:server
```

The server will run on stdio and wait for connections from Chrome DevTools.

### 2. Configure Chrome DevTools

Chrome DevTools (version 143+) supports MCP servers. To connect:

1. **Open Chrome DevTools** (F12)
2. **Go to Settings** → **Experiments** → Enable "MCP server"
3. **Configure the MCP server** in Chrome's settings:

   On Linux, create/edit: `~/.config/google-chrome/MCP.json` (or `~/.config/chromium/MCP.json`)

   On macOS: `~/Library/Application Support/Google/Chrome/MCP.json`

   On Windows: `%LOCALAPPDATA%\Google\Chrome\User Data\MCP.json`

   Add this configuration (update the paths):

```json
{
  "mcpServers": {
    "ecomus-nextjs": {
      "command": "node",
      "args": ["/home/oleg/projects/ecomus-package/ecomus-nextjs/mcp-server.mjs"],
      "cwd": "/home/oleg/projects/ecomus-package/ecomus-nextjs",
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "Amelia1",
        "MYSQL_DATABASE": "bmrsuspension"
      }
    }
  }
}
```

### 3. Use in Chrome DevTools

Once configured, Chrome DevTools will automatically connect to your MCP server. You can:

- Query your database directly from DevTools
- Access product information
- Search products
- Get application statistics
- List API routes

## Available Tools

- `query_database` - Execute SQL queries
- `get_product` - Get product by ID
- `get_products_by_category` - Get products by category
- `get_platform` - Get platform/body details
- `get_menu_data` - Get full menu structure
- `search_products` - Search products
- `get_categories` - Get categories
- `get_api_routes` - List API routes
- `get_database_stats` - Get database statistics

## Troubleshooting

**Server won't start:**
- Make sure MySQL is running
- Check database credentials in `.mcp.json` or environment variables

**Chrome can't connect:**
- Verify the absolute path to `mcp-server.mjs` is correct
- Make sure the server is running
- Check Chrome DevTools console for errors

For more details, see `MCP_SERVER_SETUP.md`.

