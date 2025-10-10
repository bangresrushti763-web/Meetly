import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import server from '../environment';
import "../styles/videoComponent.module.css";

const ToggleableWhiteboard = ({ roomId }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [socket, setSocket] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Listen for toggle event
  useEffect(() => {
    const toggleHandler = () => {
      setIsVisible(!isVisible);
    };
    
    document.addEventListener('toggleWhiteboard', toggleHandler);
    
    return () => {
      document.removeEventListener('toggleWhiteboard', toggleHandler);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      // Clean up when not visible
      return;
    }

    // Initialize socket connection when visible
    const newSocket = io(server);
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!socket || !isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight || 400;
    };

    // Initial resize
    resizeCanvas();
    
    // Add resize listener
    window.addEventListener("resize", resizeCanvas);

    // Get context and set properties
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = parseInt(lineWidth);
    ctxRef.current = ctx;

    // Listen for drawings from others
    socket.on("draw", ({ x, y, color, lineWidth, isDrawing }) => {
      if (!ctxRef.current) return;
      
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = parseInt(lineWidth);
      
      if (!isDrawing) {
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(x, y);
      } else {
        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
      }
    });

    socket.on("clear", () => {
      if (!ctxRef.current) return;
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Join the room
    socket.emit("join-call", roomId);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (socket) {
        socket.off("draw");
        socket.off("clear");
      }
    };
  }, [socket, color, lineWidth, roomId, isVisible]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setDrawing(true);

    // Send start drawing data to server
    if (socket) {
      socket.emit("draw", { x, y, color, lineWidth: parseInt(lineWidth), isDrawing: false });
    }
  };

  const stopDrawing = () => {
    if (ctxRef.current) {
      ctxRef.current.beginPath();
    }
    setDrawing(false);
  };

  const draw = (e) => {
    if (!drawing || !ctxRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();

    // Send draw data to server
    if (socket) {
      socket.emit("draw", { x, y, color, lineWidth: parseInt(lineWidth), isDrawing: true });
    }
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    
    // Send clear event to server
    if (socket) {
      socket.emit("clear");
    }
  };

  if (!isVisible) {
    return null;
  }

  // Render the full whiteboard when visible
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 300,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '80%',
        maxWidth: '900px',
        height: '70%',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 20px',
          background: 'rgba(30, 41, 59, 0.7)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ 
            color: 'white', 
            fontSize: '1.3rem', 
            margin: 0 
          }}>🖌️ Shared Whiteboard</h2>
          <button 
            onClick={() => setIsVisible(false)}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <CloseIcon style={{ fontSize: '1.2rem' }} />
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          padding: '15px 20px',
          background: 'rgba(30, 41, 59, 0.5)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          alignItems: 'center'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <label style={{ 
              color: '#cbd5e1', 
              fontSize: '0.9rem' 
            }}>Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: '36px',
                height: '36px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.1)'
              }}
            />
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <label style={{ 
              color: '#cbd5e1', 
              fontSize: '0.9rem' 
            }}>Size:</label>
            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                padding: '6px 10px'
              }}
            >
              <option value={1}>Thin</option>
              <option value={2}>Medium</option>
              <option value={5}>Thick</option>
              <option value={10}>Very Thick</option>
            </select>
          </div>
          
          <button
            onClick={clearBoard}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Clear Board
          </button>
        </div>
        
        <div style={{ 
          flex: 1, 
          padding: '15px',
          overflow: 'hidden' 
        }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseLeave={stopDrawing}
            style={{
              width: '100%',
              height: '100%',
              background: 'white',
              borderRadius: '8px',
              cursor: 'crosshair',
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>
        
        <div style={{
          padding: '10px 20px',
          background: 'rgba(30, 41, 59, 0.5)',
          color: '#94a3b8',
          fontSize: '0.85rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          Draw on the canvas above. Other participants in this meeting will see your drawings in real-time.
        </div>
      </div>
    </div>
  );
};

export default ToggleableWhiteboard;