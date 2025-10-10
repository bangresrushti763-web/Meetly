import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import server from '../environment';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ToggleablePolls = ({ roomId, isHost }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [poll, setPoll] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(server);
    setSocket(newSocket);

    newSocket.on("newPoll", (pollData) => setPoll(pollData));
    newSocket.on("updatePoll", (pollData) => setPoll(pollData));
    newSocket.on("pollEnded", () => setPoll(null));

    // Listen for toggle event
    const toggleHandler = () => {
      setIsVisible(!isVisible);
    };
    
    document.addEventListener('togglePolls', toggleHandler);
    
    return () => {
      newSocket.off("newPoll");
      newSocket.off("updatePoll");
      newSocket.off("pollEnded");
      newSocket.disconnect();
      document.removeEventListener('togglePolls', toggleHandler);
    };
  }, [isVisible]);

  const createPoll = () => {
    if (socket) {
      socket.emit("createPoll", { roomId, question, options });
    }
  };

  const vote = (index) => {
    if (socket) {
      socket.emit("votePoll", { roomId, optionIndex: index });
    }
  };

  const endPoll = () => {
    if (socket) {
      socket.emit("endPoll", { roomId });
    }
  };

  // Function to add a new option field
  const addOption = () => {
    setOptions([...options, ""]);
  };

  // Function to update an option
  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
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
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>📊 Live Polls & Quizzes</h2>
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

      {!poll && isHost && (
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Poll Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(30, 41, 59, 0.5)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              marginBottom: '15px',
              fontFamily: 'inherit'
            }}
          />
          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(30, 41, 59, 0.5)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                marginBottom: '10px',
                fontFamily: 'inherit'
              }}
            />
          ))}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
            <button
              onClick={addOption}
              style={{
                padding: '8px 16px',
                background: 'rgba(100, 116, 139, 0.5)',
                color: 'white',
                border: '1px solid rgba(100, 116, 139, 0.7)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ➕ Add Option
            </button>
            <button
              onClick={createPoll}
              disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(45deg, #38bdf8, #0ea5e9)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (!question.trim() || options.filter(opt => opt.trim()).length < 2) ? 'not-allowed' : 'pointer',
                opacity: (!question.trim() || options.filter(opt => opt.trim()).length < 2) ? 0.7 : 1,
                fontWeight: '500'
              }}
            >
              ✅ Start Poll
            </button>
          </div>
        </div>
      )}

      {poll && (
        <div>
          <h3 style={{ 
            fontSize: '1.1rem', 
            marginBottom: '15px', 
            fontWeight: '600' 
          }}>
            {poll.question}
          </h3>
          <ul style={{ marginBottom: '20px' }}>
            {poll.options.map((opt, i) => (
              <li key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '10px',
                padding: '8px',
                background: 'rgba(30, 41, 59, 0.3)',
                borderRadius: '6px'
              }}>
                {!isHost && (
                  <button
                    onClick={() => vote(i)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#22c55e',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Vote
                  </button>
                )}
                <span style={{ flex: 1 }}>{opt}</span>
                <span style={{ fontWeight: '600' }}> ({poll.votes[i]} votes)</span>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={300} height={300}>
              <Pie
                data={poll.options.map((opt, i) => ({
                  name: opt,
                  value: poll.votes[i],
                }))}
                cx={150}
                cy={150}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {poll.options.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: 'white'
                }}
              />
              <Legend />
            </PieChart>
          </div>

          {isHost && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button
                onClick={endPoll}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                🛑 End Poll
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToggleablePolls;