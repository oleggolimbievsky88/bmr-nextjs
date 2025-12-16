# MCP Server Quick Start

## Important Note

**MCP (Model Context Protocol) servers are designed for AI coding assistants, NOT Chrome DevTools.**

Chrome DevTools does **not** have native MCP server support. MCP servers work with:
- **Cursor IDE** (which you're already using!) ✅
- Claude Desktop
- Other MCP-compatible AI assistants

## Use with Cursor IDE (Recommended & Only Supported Method)

Since you're already using Cursor IDE, **this is the way** to use your MCP server:

1. **Start the MCP Server:**
   ```bash
   pnpm run mcp:server
   ```
   Keep this running in a terminal.

2. **Configure in Cursor Settings** (see `CURSOR_MCP_SETUP.md` for detailed instructions)
3. **Restart Cursor**
4. **Use the AI assistant** - it will have access to all your database and application tools!

The MCP server will allow Cursor's AI to:
- Query your database directly
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

**Cursor can't connect:**
- Verify the absolute path to `mcp-server.mjs` is correct in Cursor settings
- Make sure the server is running (`pnpm run mcp:server`)
- Check Cursor's developer console for errors (Help → Toggle Developer Tools)

**Note:** Chrome DevTools does not support MCP servers. Use Cursor IDE instead.

For detailed setup instructions, see `CURSOR_MCP_SETUP.md`.

