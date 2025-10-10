import React, { useState } from "react";

const AIMeetingNotes = () => {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");

  const handleSummarize = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/meeting-notes/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
      } else {
        console.error("Error summarizing:", data.error);
      }
    } catch (error) {
      console.error("Error summarizing:", error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Meeting_Notes.txt";
    a.click();
  };

  return (
    <div className="p-4 border rounded bg-gray-100 mt-4">
      <h2 className="text-lg font-bold mb-2">📝 AI Meeting Notes</h2>

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste or auto-capture meeting transcript here..."
        className="w-full p-2 border rounded mb-2"
        rows={5}
      />

      <button
        onClick={handleSummarize}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        Summarize
      </button>

      {summary && (
        <div className="mt-4">
          <h3 className="font-semibold">📄 Summary:</h3>
          <p className="whitespace-pre-wrap">{summary}</p>
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white px-4 py-2 rounded mt-2"
          >
            ⬇️ Download Notes
          </button>
        </div>
      )}
    </div>
  );
};

export default AIMeetingNotes;