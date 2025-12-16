# Setting Up MCP Server in Cursor IDE

Since you're using Cursor IDE, you can configure the MCP server directly in Cursor's settings. This is the recommended way to use MCP servers.

## Step 1: Start Your MCP Server

First, make sure your MCP server can run:

```bash
pnpm run mcp:server
```

The server should start and wait for connections. You can test it's working by seeing "Ecomus Next.js MCP server running on stdio" in the output.

## Step 2: Configure MCP Server in Cursor

1. **Open Cursor Settings:**
   - Press `Ctrl+,` (or `Cmd+,` on Mac)
   - Or go to `File` → `Preferences` → `Settings`

2. **Search for "MCP"** in the settings search bar

3. **Add MCP Server Configuration:**
   - Look for "MCP Servers" or "Model Context Protocol" settings
   - Or manually edit Cursor's configuration file

4. **Configuration File Location:**
   - The MCP configuration is typically stored in Cursor's settings JSON
   - You can access it via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Search for "Preferences: Open User Settings (JSON)"

5. **Add this configuration** to your Cursor settings:

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

**Important:** Update the absolute path `/home/oleg/projects/ecomus-package/ecomus-nextjs/mcp-server.mjs` to match your actual project path.

## Step 3: Restart Cursor

After adding the configuration, restart Cursor IDE to load the MCP server.

## Step 4: Verify Connection

Once Cursor restarts, the MCP server should be available. You can verify by:

1. Opening the Command Palette (`Ctrl+Shift+P`)
2. Looking for MCP-related commands
3. The AI assistant in Cursor should now have access to your database and application tools

## Available Tools

Once configured, Cursor's AI assistant can use these tools:

- `query_database` - Execute SQL queries against your MySQL database
- `get_product` - Get product details by ID
- `get_products_by_category` - Get products filtered by category
- `get_platform` - Get platform/body details
- `get_menu_data` - Get full menu structure
- `search_products` - Search products by part number or keyword
- `get_categories` - Get all categories
- `get_api_routes` - List all API routes
- `get_database_stats` - Get database statistics

## Using the MCP Server

When you ask Cursor's AI assistant questions about your application, it can now:

- Query your database directly
- Look up product information
- Search for products
- Get application statistics
- Access your API routes

For example, you could ask:
- "How many products are in the database?"
- "What products are in category X?"
- "Search for products with 'suspension' in the name"
- "Get the menu structure"

## Troubleshooting

**MCP server won't start:**
- Make sure MySQL is running
- Check database credentials
- Verify Node.js version is 22.x or later

**Cursor can't connect:**
- Verify the absolute path to `mcp-server.mjs` is correct
- Make sure the server starts without errors
- Check Cursor's developer console for errors (Help → Toggle Developer Tools)

**Tools not available:**
- Restart Cursor after configuration changes
- Check that the MCP server is running
- Verify the configuration JSON syntax is correct

## Alternative: Chrome DevTools Setup

If you specifically want to use Chrome DevTools (though Cursor is recommended):

1. Enable Developer Tools experiments:
   - Go to `chrome://flags`
   - Search for "Developer Tools experiments"
   - Enable it and restart Chrome

2. Open Chrome DevTools (F12)
3. Go to Settings (gear icon) → Experiments tab
4. Look for MCP server options

However, **Cursor IDE integration is the primary and recommended way** to use MCP servers.

