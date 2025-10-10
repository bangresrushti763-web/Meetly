import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";
import server from '../environment';

const ToggleableCodeCollab = () => {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("javascript");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const socketRef = useRef(null);

  // Listen for toggle event
  useEffect(() => {
    const toggleHandler = () => {
      setIsVisible(!isVisible);
    };
    
    document.addEventListener('toggleCodeCollab', toggleHandler);
    
    return () => {
      document.removeEventListener('toggleCodeCollab', toggleHandler);
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      // Initialize socket connection when component becomes visible
      socketRef.current = io(server);

      // Request current code when component mounts
      socketRef.current.emit("get-code");

      // Initialize code for new user
      socketRef.current.on("init-code", (sharedCode) => {
        setCode(sharedCode);
        setIsEditorReady(true);
      });

      // Update when others type
      socketRef.current.on("update-code", (newCode) => {
        setCode(newCode);
      });
    } else {
      // Clean up socket connection when component is hidden
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }

    // Clean up socket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isVisible]);

  // Handle local typing
  const handleChange = (value) => {
    setCode(value);
    if (socketRef.current) {
      socketRef.current.emit("code-change", value);
    }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
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
      width: '80%',
      maxWidth: '900px',
      maxHeight: '80vh',
      overflow: 'hidden',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>👨‍💻 Live Code Collaboration</h2>
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

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '10px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px'
        }}>
          <label style={{ color: 'white', fontSize: '0.9rem' }}>Language:</label>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.9rem'
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="typescript">TypeScript</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>
      
      <div style={{ 
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
        flex: 1
      }}>
        <Editor
          height="400px"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleChange}
          loading="Loading code editor..."
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            suggestOnTriggerCharacters: true,
            wordBasedSuggestions: true,
            quickSuggestions: true,
            fontFamily: "Monaco, Menlo, 'Ubuntu Mono', monospace",
          }}
        />
      </div>
      
      <div style={{ 
        marginTop: '10px', 
        fontSize: '0.8rem', 
        color: '#94a3b8',
        fontStyle: 'italic'
      }}>
        Tip: All participants in this meeting see the same code in real-time. 
        Changes you make will instantly appear for everyone else.
      </div>
    </div>
  );
};

export default ToggleableCodeCollab;