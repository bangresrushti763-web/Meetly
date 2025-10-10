import React, { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";
import server from '../environment';

const CodeCollab = () => {
  const [code, setCode] = useState("// Loading...");
  const [language, setLanguage] = useState("javascript");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
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

    // Clean up socket connection
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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

  return (
    <div className="p-4 border rounded-md bg-gray-800 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-white">👨‍💻 Live Code Collaboration</h2>
        <div className="flex items-center space-x-2">
          <label className="text-white text-sm">Language:</label>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
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
      
      <div className="border rounded overflow-hidden">
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
      
      <div className="mt-2 text-xs text-gray-400">
        Tip: All participants in this meeting see the same code in real-time. 
        Changes you make will instantly appear for everyone else.
      </div>
    </div>
  );
};

export default CodeCollab;