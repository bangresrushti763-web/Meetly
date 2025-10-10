import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import server from '../environment';
import "../styles/videoComponent.module.css";

const Whiteboard = ({ roomId }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [socket, setSocket] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(server);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight || 400;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Get context and set properties
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;

    // Listen for drawings from others
    socket.on("draw", ({ x, y, color, lineWidth, isDrawing }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      
      if (!isDrawing) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    });

    socket.on("clear", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Join the room
    socket.emit("join-call", roomId);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      socket.off("draw");
      socket.off("clear");
    };
  }, [socket, color, lineWidth, roomId]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setDrawing(true);

    // Send start drawing data to server
    if (socket) {
      socket.emit("draw", { x, y, color, lineWidth, isDrawing: false });
    }
  };

  const stopDrawing = () => {
    ctxRef.current.beginPath();
    setDrawing(false);
  };

  const draw = (e) => {
    if (!drawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();

    // Send draw data to server
    if (socket) {
      socket.emit("draw", { x, y, color, lineWidth, isDrawing: true });
    }
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Send clear event to server
    if (socket) {
      socket.emit("clear");
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Expose toggle function to parent components
  Whiteboard.toggleVisibility = () => {
    // This will be called from parent components
    document.dispatchEvent(new CustomEvent('toggleWhiteboard'));
  };

  // Listen for toggle events from parent components
  useEffect(() => {
    const handleToggle = () => setIsVisible(prev => !prev);
    document.addEventListener('toggleWhiteboard', handleToggle);
    return () => document.removeEventListener('toggleWhiteboard', handleToggle);
  }, []);

  // Render only the toggle button when not visible
  if (!isVisible) {
    return (
      <div className="whiteboard-toggle" onClick={toggleVisibility}>
        <div className="whiteboard-toggle-button">
          <EditIcon style={{ marginRight: '8px' }} />
          Whiteboard
        </div>
      </div>
    );
  }

  // Render the full whiteboard when visible
  return (
    <div className="whiteboard-overlay">
      <div className="whiteboard-container">
        <div className="whiteboard-header">
          <h2>🖌️ Shared Whiteboard</h2>
          <div className="whiteboard-controls">
            <button 
              onClick={toggleVisibility} 
              className="whiteboard-close-btn"
            >
              <CloseIcon style={{ fontSize: '1.2rem' }} />
            </button>
          </div>
        </div>
        <div className="whiteboard-toolbar">
          <div className="toolbar-group">
            <label>Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-picker"
            />
          </div>
          <div className="toolbar-group">
            <label>Size:</label>
            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(e.target.value)}
              className="line-width-select"
            >
              <option value={1}>Thin</option>
              <option value={2}>Medium</option>
              <option value={5}>Thick</option>
              <option value={10}>Very Thick</option>
            </select>
          </div>
          <button
            onClick={clearBoard}
            className="clear-button"
          >
            Clear Board
          </button>
        </div>
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseLeave={stopDrawing}
            className="whiteboard-canvas"
          />
        </div>
        <div className="whiteboard-footer">
          Draw on the canvas above. Other participants in this meeting will see your drawings in real-time.
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;