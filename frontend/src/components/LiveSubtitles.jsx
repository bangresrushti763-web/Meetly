import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import server from '../environment';

const LiveSubtitles = ({ targetLang = "es", onTranslationUpdate }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [targetLang, onTranslationUpdate]);

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

  return (
    <div className="p-4 border rounded-md bg-gray-50 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">🎤 Live Subtitles & Translation</h2>
        <div className="text-sm text-gray-600">
          Translating to: {getLanguageName(targetLang)} ({targetLang})
        </div>
      </div>
      
      {!isSupported ? (
        <div className="text-red-500 p-2 bg-red-50 rounded">
          {error}
        </div>
      ) : (
        <>
          <button
            onClick={toggleListening}
            className={`px-4 py-2 rounded text-white font-medium ${
              listening ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            } transition-colors`}
          >
            {listening ? "⏹ Stop Listening" : "▶ Start Listening"}
          </button>

          {error && (
            <div className="text-red-500 mt-2 text-sm">
              {error}
            </div>
          )}

          <div className="mt-3 space-y-3">
            <div>
              <h3 className="font-bold text-gray-700">📝 Transcript (English):</h3>
              <div className="p-3 bg-white rounded border min-h-[60px]">
                <p className="text-gray-800">{transcript || "Waiting for speech..."}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-700">
                🌍 Translation ({getLanguageName(targetLang)}):
              </h3>
              <div className="p-3 bg-blue-50 rounded border min-h-[60px]">
                <p className="text-blue-800">{translation || "Translation will appear here..."}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Note: For best results, speak clearly in English. Click "Stop Listening" when finished.
          </div>
        </>
      )}
    </div>
  );
};

export default LiveSubtitles;