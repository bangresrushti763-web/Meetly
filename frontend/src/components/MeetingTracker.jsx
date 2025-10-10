import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import server from '../environment';

const MeetingTracker = ({ userId, username }) => {
  const [times, setTimes] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(server);

    socketRef.current.on("update-times", (data) => {
      setTimes({ ...data });
    });

    // Clean up socket connection
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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

  return (
    <div className="p-4 border rounded-md bg-gray-50 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">⏱️ Meeting Time Tracker</h2>
        <div className="text-sm text-gray-600">
          {isSpeaking ? "🎤 Speaking..." : "🔇 Not speaking"}
        </div>
      </div>
      
      <button
        onMouseDown={startSpeaking}
        onMouseUp={stopSpeaking}
        onMouseLeave={stopSpeaking}
        onTouchStart={startSpeaking}
        onTouchEnd={stopSpeaking}
        className={`px-4 py-2 rounded text-white font-medium transition-colors ${
          isSpeaking 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isSpeaking ? "⏹ Stop Speaking" : "🎤 Hold to Speak"}
      </button>

      <div className="mt-4">
        <h3 className="font-bold text-gray-700 mb-2">📊 Participation Dashboard</h3>
        {getSortedParticipants().length > 0 ? (
          <div className="space-y-2">
            {getSortedParticipants().map((participant, index) => (
              <div 
                key={participant.id} 
                className={`flex justify-between items-center p-2 rounded ${
                  participant.id === userId ? "bg-blue-100" : "bg-white"
                }`}
              >
                <div className="flex items-center">
                  <span className="font-medium">
                    {participant.id === userId ? `You (${username || 'You'})` : `Participant ${index + 1}`}
                  </span>
                  {index === 0 && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                      Top Speaker
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-mono">
                    {formatTime(participant.total + (participant.current || 0))}s
                  </div>
                  {participant.current > 0 && (
                    <div className="text-xs text-green-600">
                      +{formatTime(participant.current)}s (current)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No speaking data yet. Hold the button to start speaking.</p>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Tip: Hold the button while speaking to track your participation time.
      </div>
    </div>
  );
};

export default MeetingTracker;