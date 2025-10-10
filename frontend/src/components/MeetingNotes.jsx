import React, { useState } from "react";
import axios from "axios";
import server from '../environment';

const MeetingNotes = ({ meetingId }) => {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meetingNotesId, setMeetingNotesId] = useState("");

  const handleSummarize = async () => {
    if (!transcript.trim()) {
      setError("Please enter a meeting transcript first.");
      return;
    }
    
    setLoading(true);
    setError("");
    setSummary("");
    setActionItems([]);
    setMeetingNotesId("");

    try {
      const res = await axios.post(`${server}/api/v1/meeting-notes/summarize-text`, {
        transcript,
        meetingId
      });
      
      setSummary(res.data.summary);
      setActionItems(res.data.actionItems || []);
      setMeetingNotesId(res.data.meetingNotesId);
    } catch (error) {
      console.error("Error summarizing:", error);
      setError("Failed to summarize meeting notes. Please try again.");
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (!summary) return;
    
    let content = "MEETING NOTES SUMMARY\n\n";
    content += "====================\n\n";
    content += `Meeting ID: ${meetingId}\n\n`;
    content += "TRANSCRIPT:\n";
    content += "-----------\n";
    content += transcript + "\n\n";
    content += "SUMMARY:\n";
    content += "--------\n";
    content += summary + "\n\n";
    
    if (actionItems && actionItems.length > 0) {
      content += "ACTION ITEMS:\n";
      content += "-------------\n";
      actionItems.forEach((item, index) => {
        content += `${index + 1}. ${item}\n`;
      });
      content += "\n";
    }
    
    content += `Generated on: ${new Date().toLocaleString()}\n`;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Meeting_Notes_${meetingId || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = () => {
    if (meetingNotesId) {
      window.open(`/meeting-notes/${meetingNotesId}`, '_blank');
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 mt-4">
      <h2 className="text-lg font-bold mb-2">📝 AI Meeting Notes</h2>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meeting Transcript
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste or enter your meeting transcript here..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          rows={6}
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Summarizing..." : "Summarize with AI"}
        </button>
        
        {summary && (
          <>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              ⬇️ Download Notes
            </button>
            <button
              onClick={handleViewDetails}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              View Details
            </button>
          </>
        )}
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {loading && (
        <div className="mt-4">
          <p>Generating AI summary... This may take a moment.</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: "75%" }}></div>
          </div>
        </div>
      )}

      {summary && (
        <div className="mt-4 p-4 bg-white rounded-md shadow">
          <h3 className="font-bold text-lg mb-2">📄 Summary:</h3>
          <div className="text-gray-800 mb-4 p-2 bg-gray-50 rounded whitespace-pre-wrap">
            {summary}
          </div>

          {actionItems && actionItems.length > 0 && (
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">📌 Action Items:</h3>
              <ul className="list-disc pl-5 text-gray-800 bg-gray-50 p-2 rounded">
                {actionItems.map((item, index) => (
                  <li key={index} className="mb-1">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-4">
            Meeting Notes ID: {meetingNotesId}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingNotes;