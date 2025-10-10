import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import server from '../environment';

const ToggleableMeetingTracker = ({ userId, username }) => {
  const [times, setTimes] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(server);

    socketRef.current.on("update-times", (data) => {
      setTimes({ ...data });
    });

    // Listen for toggle event
    const toggleHandler = () => {
      setIsVisible(!isVisible);
    };
    
    document.addEventListener('toggleMeetingTracker', toggleHandler);

    // Clean up socket connection and event listener
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      document.removeEventListener('toggleMeetingTracker', toggleHandler);
    };
  }, [isVisible]);

  const startSpeaking = () => {
    if (socketRef.current) {
      socketRef.current.emit("start-speaking", userId);
      setIsSpeaking(true);
    }
  };

  const stopSpeaking = () => {
    if (socketRef.current) {
      socketRef.current.emit("stop-speaking", userId);
      setIsSpeaking(false);
    }
  };

  // Format time in seconds
  const formatTime = (milliseconds) => {
    return (milliseconds / 1000).toFixed(1);
  };

  // Get sorted list of participants by speaking time
  const getSortedParticipants = () => {
    return Object.entries(times)
      .sort(([, a], [, b]) => b.total - a.total)
      .map(([id, record]) => ({
        id,
        total: record.total,
        current: record.start ? Date.now() - record.start : 0
      }));
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
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>⏱️ Meeting Time Tracker</h2>
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
      
      <button
        onMouseDown={startSpeaking}
        onMouseUp={stopSpeaking}
        onMouseLeave={stopSpeaking}
        onTouchStart={startSpeaking}
        onTouchEnd={stopSpeaking}
        style={{
          padding: '12px 24px',
          borderRadius: '6px',
          color: 'white',
          fontWeight: '500',
          border: 'none',
          cursor: 'pointer',
          background: isSpeaking 
            ? 'linear-gradient(45deg, #ef4444, #dc2626)' 
            : 'linear-gradient(45deg, #3b82f6, #2563eb)',
          transition: 'all 0.2s ease',
          width: '100%',
          marginBottom: '20px'
        }}
      >
        {isSpeaking ? "⏹ Stop Speaking" : "🎤 Hold to Speak"}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          marginBottom: '15px', 
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📊 Participation Dashboard
        </h3>
        {getSortedParticipants().length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {getSortedParticipants().map((participant, index) => (
              <div 
                key={participant.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  background: participant.id === userId ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500' }}>
                    {participant.id === userId ? `You (${username || 'You'})` : `Participant ${index + 1}`}
                  </span>
                  {index === 0 && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '0.75rem',
                      background: 'rgba(251, 191, 36, 0.2)',
                      color: '#f59e0b',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      Top Speaker
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {formatTime(participant.total + (participant.current || 0))}s
                  </div>
                  {participant.current > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>
                      +{formatTime(participant.current)}s (current)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(30, 41, 59, 0.3)',
            borderRadius: '8px'
          }}>
            No speaking data yet. Hold the button to start speaking.
          </p>
        )}
      </div>

      <div style={{ 
        marginTop: '15px', 
        fontSize: '0.75rem', 
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center'
      }}>
        Tip: Hold the button while speaking to track your participation time.
      </div>
    </div>
  );
};

export default ToggleableMeetingTracker;