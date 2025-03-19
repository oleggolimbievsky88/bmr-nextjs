import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Log available global functions
    console.log('Available globals:', Object.keys(global));
    
    // Check if MCP functions exist
    const hasMcpQuery = typeof global.mcp_MySQL_MCP_query === 'function';
    const hasMcpConnect = typeof global.mcp_MySQL_MCP_connect_db === 'function';
    
    console.log('Has MCP Query:', hasMcpQuery);
    console.log('Has MCP Connect:', hasMcpConnect);

    if (!hasMcpQuery || !hasMcpConnect) {
      return NextResponse.json({ 
        error: 'MCP functions not found on server',
        availableGlobals: Object.keys(global)
      });
    }

    // Try to connect
    await global.mcp_MySQL_MCP_connect_db({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmrsuspension'
    });

    // Try a simple query
    const result = await global.mcp_MySQL_MCP_query({
      sql: 'SELECT 1 as test'
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 