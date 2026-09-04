"use client";

"use client";

import { useState } from "react";

export default function RemoteAdmin() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generateAndPublishAd = async () => {
    if (!prompt.trim()) {
      alert("Mangyaring maglagay ng prompt bago mag-submit.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate-ad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        alert("Ad pushed to digital signage remote!");
        setPrompt("");
      } else {
        alert("Failed to generate ad. Please check your API settings.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Signage Remote Control</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe product ad (e.g., 'Special discount on wireless headphones')"
        className="w-full border p-3 rounded mb-4"
        rows={4}
      />
      <button
        onClick={generateAndPublishAd}
        disabled={loading || !prompt.trim()}
        className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:bg-gray-400"
      >
        {loading ? "AI is generating ad..." : "Generate & Publish to Screen"}
      </button>
    </div>
  );
}