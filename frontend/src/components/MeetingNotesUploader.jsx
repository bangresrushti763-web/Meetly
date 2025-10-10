import React, { useState, useEffect } from "react";
import axios from "axios";
import server from '../environment';

const MeetingNotesUploader = ({ meetingId }) => {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Listen for toggle event
  useEffect(() => {
    const toggleHandler = () => {
      setIsVisible(!isVisible);
    };
    
    document.addEventListener('toggleMeetingNotesUploader', toggleHandler);
    
    return () => {
      document.removeEventListener('toggleMeetingNotesUploader', toggleHandler);
    };
  }, [isVisible]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setNotes(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an audio file first.");
      return;
    }
    
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("meetingId", meetingId);

    try {
      const res = await axios.post(`${server}/api/v1/meeting-notes/upload-audio`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNotes(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to process meeting notes. Please try again.");
    }
    setLoading(false);
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
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>📋 AI Meeting Notes</h2>
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
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          style={{
            width: '100%',
            padding: '8px',
            background: 'rgba(30, 41, 59, 0.5)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px'
          }}
        />
      </div>
      
      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(45deg, #38bdf8, #0ea5e9)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          fontWeight: '500'
        }}
      >
        {loading ? "Processing..." : "Upload & Process"}
      </button>

      {error && <p style={{ color: '#ef4444', marginTop: '10px' }}>{error}</p>}

      {loading && (
        <div style={{ marginTop: '15px' }}>
          <p>Processing audio... This may take a moment.</p>
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

      {notes && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: 'rgba(30, 41, 59, 0.5)', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>📝 Transcript:</h3>
          <p style={{ 
            fontSize: '0.9rem', 
            marginBottom: '15px', 
            padding: '10px', 
            background: 'rgba(15, 23, 42, 0.5)', 
            borderRadius: '6px' 
          }}>
            {notes.transcript}
          </p>

          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>✅ Summary:</h3>
          <div style={{ 
            fontSize: '0.9rem', 
            marginBottom: '15px', 
            padding: '10px', 
            background: 'rgba(15, 23, 42, 0.5)', 
            borderRadius: '6px' 
          }}>
            {notes.summary}
          </div>

          {notes.actionItems && notes.actionItems.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>📌 Action Items:</h3>
              <ul style={{ 
                paddingLeft: '20px', 
                fontSize: '0.9rem', 
                padding: '10px', 
                background: 'rgba(15, 23, 42, 0.5)', 
                borderRadius: '6px' 
              }}>
                {notes.actionItems.map((item, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div style={{ 
            marginTop: '15px', 
            fontSize: '0.8rem', 
            color: 'rgba(255, 255, 255, 0.7)' 
          }}>
            Meeting Notes ID: {notes.meetingNotesId}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingNotesUploader;