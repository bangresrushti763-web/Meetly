import React, { useState, useEffect } from "react";
import server from '../environment';

const ToggleableAIMeetingNotes = () => {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Listen for toggle event
  useEffect(() => {
    const toggleHandler = () => {
      setIsVisible(!isVisible);
    };
    
    document.addEventListener('toggleAIMeetingNotes', toggleHandler);
    
    return () => {
      document.removeEventListener('toggleAIMeetingNotes', toggleHandler);
    };
  }, [isVisible]);

  const handleSummarize = async () => {
    if (!transcript.trim()) {
      return;
    }
    
    setLoading(true);
    setSummary("");
    setActionItems([]);
    
    try {
      const res = await fetch(`${server}/api/v1/meeting-notes/summarize-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        setActionItems(data.actionItems || []);
      } else {
        console.error("Error summarizing:", data.error);
      }
    } catch (error) {
      console.error("Error summarizing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    let content = "MEETING NOTES\n\n";
    content += "====================\n\n";
    content += "Transcript:\n";
    content += transcript + "\n\n";
    content += "Summary:\n";
    content += summary + "\n\n";
    
    if (actionItems.length > 0) {
      content += "Action Items:\n";
      actionItems.forEach((item, index) => {
        content += `${index + 1}. ${item}\n`;
      });
    }
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Meeting_Notes.txt";
    a.click();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 200,
      width: '500px',
      maxHeight: '80vh',
      overflowY: 'auto',
      color: 'white'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>📝 AI Meeting Notes</h2>
        <button 
          onClick={() => setIsVisible(false)}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            lineHeight: 1
          }}
        >
          ×
        </button>
      </div>

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste or auto-capture meeting transcript here..."
        style={{
          width: '100%',
          padding: '12px',
          background: 'rgba(30, 41, 59, 0.5)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          marginBottom: '15px',
          minHeight: '120px',
          fontFamily: 'inherit'
        }}
      />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={handleSummarize}
          disabled={loading || !transcript.trim()}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(45deg, #38bdf8, #0ea5e9)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: (loading || !transcript.trim()) ? 'not-allowed' : 'pointer',
            opacity: (loading || !transcript.trim()) ? 0.7 : 1,
            fontWeight: '500'
          }}
        >
          {loading ? "Processing..." : "Summarize"}
        </button>

        {summary && (
          <button
            onClick={handleDownload}
            style={{
              padding: '10px 20px',
              background: 'rgba(34, 197, 94, 0.2)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ⬇️ Download Notes
          </button>
        )}
      </div>

      {loading && (
        <div style={{ 
          padding: '15px', 
          background: 'rgba(30, 41, 59, 0.5)', 
          borderRadius: '8px', 
          marginBottom: '15px' 
        }}>
          <p>Processing transcript... This may take a moment.</p>
          <div style={{ 
            width: '100%', 
            background: 'rgba(30, 41, 59, 0.5)', 
            borderRadius: '4px', 
            height: '10px', 
            marginTop: '8px' 
          }}>
            <div 
              style={{ 
                background: 'linear-gradient(45deg, #38bdf8, #0ea5e9)', 
                height: '100%', 
                borderRadius: '4px', 
                width: "75%",
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            ></div>
          </div>
        </div>
      )}

      {summary && (
        <div style={{ 
          padding: '15px', 
          background: 'rgba(30, 41, 59, 0.5)', 
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>📄 Summary:</h3>
          <div style={{ 
            fontSize: '0.9rem', 
            marginBottom: '15px', 
            padding: '10px', 
            background: 'rgba(15, 23, 42, 0.5)', 
            borderRadius: '6px',
            whiteSpace: 'pre-wrap'
          }}>
            {summary}
          </div>

          {actionItems && actionItems.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>📌 Action Items:</h3>
              <ul style={{ 
                paddingLeft: '20px', 
                fontSize: '0.9rem', 
                padding: '10px', 
                background: 'rgba(15, 23, 42, 0.5)', 
                borderRadius: '6px' 
              }}>
                {actionItems.map((item, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToggleableAIMeetingNotes;