const { spawn } = require('child_process');
const path = require('path');

// Start the MySQL MCP server
const mysqlMcpServer = spawn('node', [
  path.join(__dirname, '../Vercel/mcp-mysql-server/build/index.js')
]);

mysqlMcpServer.stdout.on('data', (data) => {
  console.log(`MySQL MCP: ${data}`);
});

mysqlMcpServer.stderr.on('data', (data) => {
  console.error(`MySQL MCP Error: ${data}`);
});

mysqlMcpServer.on('close', (code) => {
  console.log(`MySQL MCP process exited with code ${code}`);
}); dd