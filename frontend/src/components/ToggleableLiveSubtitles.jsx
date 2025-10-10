import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import server from '../environment';

const ToggleableLiveSubtitles = ({ targetLang = "es", onTranslationUpdate }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const recognitionRef = useRef(null);

  // Listen for toggle event
  useEffect(() => {
    const toggleHandler = () => {
      setIsVisible(!isVisible);
    };
    
    document.addEventListener('toggleLiveSubtitles', toggleHandler);
    
    return () => {
      document.removeEventListener('toggleLiveSubtitles', toggleHandler);
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError("Your browser does not support speech recognition. Please try Chrome or Edge.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = async (event) => {
        const lastResult = event.results[event.results.length - 1];
        const text = lastResult[0].transcript;
        setTranscript(text);

        // Only translate if the result is final
        if (lastResult.isFinal) {
          try {
            // Send to backend for translation
            const res = await axios.post(`${server}/api/v1/translate/translate`, {
              text,
              targetLang,
            });
            
            setTranslation(res.data.translatedText);
            
            // Call the callback if provided
            if (onTranslationUpdate) {
              onTranslationUpdate({
                original: text,
                translated: res.data.translatedText,
                from: res.data.from,
                to: res.data.to
              });
            }
          } catch (err) {
            console.error("Translation error:", err);
            setError("Failed to translate text. Please try again.");
          }
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError(`Speech recognition error: ${event.error}`);
        setListening(false);
      };

      recognition.onend = () => {
        if (listening) {
          // Restart recognition if it was supposed to be listening
          recognition.start();
        }
      };
    } else {
      // Clean up recognition when component is hidden
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setListening(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isVisible, targetLang, onTranslationUpdate, listening]);

  const toggleListening = () => {
    if (!isSupported) return;
    
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setError("");
      setTranscript("");
      setTranslation("");
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // Map language codes to full names
  const getLanguageName = (code) => {
    const languages = {
      "es": "Spanish",
      "fr": "French",
      "de": "German",
      "it": "Italian",
      "pt": "Portuguese",
      "ru": "Russian",
      "zh": "Chinese",
      "ja": "Japanese",
      "ko": "Korean",
      "hi": "Hindi",
      "en": "English"
    };
    return languages[code] || code;
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
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🎤 Live Subtitles & Translation</h2>
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
      
      {!isSupported ? (
        <div style={{ 
          color: '#ef4444', 
          padding: '10px', 
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px',
          marginBottom: '10px'
        }}>
          {error}
        </div>
      ) : (
        <>
          <button
            onClick={toggleListening}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              color: 'white',
              fontWeight: '500',
              background: listening ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {listening ? "⏹ Stop Listening" : "▶ Start Listening"}
          </button>

          {error && (
            <div style={{ 
              color: '#ef4444', 
              marginTop: '10px', 
              fontSize: '0.9rem' 
            }}>
              {error}
            </div>
          )}

          <div style={{ 
            marginTop: '15px', 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px' 
          }}>
            <div>
              <h3 style={{ 
                fontWeight: '600', 
                color: '#e2e8f0',
                marginBottom: '8px',
                fontSize: '1rem'
              }}>📝 Transcript (English):</h3>
              <div style={{ 
                padding: '12px', 
                background: 'rgba(30, 41, 59, 0.7)',
                borderRadius: '8px', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <p style={{ 
                  color: '#f1f5f9',
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  {transcript || "Waiting for speech..."}
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ 
                fontWeight: '600', 
                color: '#e2e8f0',
                marginBottom: '8px',
                fontSize: '1rem'
              }}>
                🌍 Translation ({getLanguageName(targetLang)}):
              </h3>
              <div style={{ 
                padding: '12px', 
                background: 'rgba(30, 41, 59, 0.7)',
                borderRadius: '8px', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <p style={{ 
                  color: '#f1f5f9',
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  {translation || "Translation will appear here..."}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: '15px', 
            fontSize: '0.8rem', 
            color: '#94a3b8',
            fontStyle: 'italic'
          }}>
            Note: For best results, speak clearly in English. Click "Stop Listening" when finished.
          </div>
        </>
      )}
    </div>
  );
};

export default ToggleableLiveSubtitles;