'use client';

import { useEffect, useState } from 'react';

export default function TestMCP() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testMCP() {
      try {
        const response = await fetch('/api/test-mcp');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setResult(data);
      } catch (err) {
        setError(err.message);
        console.error('Test failed:', err);
      } finally {
        setLoading(false);
      }
    }

    testMCP();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">MCP Test Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {loading && (
        <div className="text-gray-600">
          Testing MCP connection...
        </div>
      )}
      
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="font-bold mb-2">Test Result:</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 