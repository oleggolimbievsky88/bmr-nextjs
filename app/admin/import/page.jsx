"use client";
import { useState } from "react";

export default function ImportPage() {
  const [status, setStatus] = useState("");
  const [debug, setDebug] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Uploading...");
    setDebug(null);

    const formData = new FormData();
    const fileInput = e.target.querySelector('input[type="file"]');
    formData.append("file", fileInput.files[0]);

    try {
      console.log("Sending request to /api/admin/import");
      const response = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        setStatus(`Success: ${data.message}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }

      if (data.debug) {
        setDebug(data.debug);
      }
    } catch (error) {
      console.error("Import failed:", error);
      setStatus("Import failed: " + error.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Import PIES Data</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="pies-file" className="block mb-2">
          PIES XML File:
        </label>
        <input
          type="file"
          accept=".xml"
          required
          className="mb-4 block"
          name="file"
          id="pies-file"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Import
        </button>
      </form>

      {status && <div className="mt-4 p-2 border rounded">{status}</div>}

      {debug && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <h2 className="font-bold">Debug Info:</h2>
          <ul className="mb-4">
            <li>Total Items: {debug.totalItems}</li>
            {debug.xmlVersion && <li>PIES Version: {debug.xmlVersion}</li>}
            {debug.sampleItem && (
              <li>
                Sample Item: {debug.sampleItem.partNumber} (
                {debug.sampleItem.brand})
              </li>
            )}
          </ul>
          {debug.sampleData?.attributes && (
            <div>
              <h3 className="font-bold mb-2">Product Attributes:</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2">Attribute</th>
                    <th className="p-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {debug.sampleData.attributes.map((attr, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{attr.name}</td>
                      <td className="p-2">{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
