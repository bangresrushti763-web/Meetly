import React, { useState, useEffect } from "react";
import axios from "axios";
import server from '../environment';
import { useParams } from "react-router-dom";
import Header from '../components/Header';
import Footer from '../components/Footer';
import "../App.css";

const MeetingNotes = () => {
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();

  useEffect(() => {
    const fetchMeetingNotes = async () => {
      try {
        const res = await axios.get(`${server}/api/v1/meeting-notes/${id}`);
        setNotes(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch meeting notes.");
      }
      setLoading(false);
    };

    if (id) {
      fetchMeetingNotes();
    }
  }, [id]);

  if (loading) {
    return (
      <div>
        <Header showHistory={true} showLogout={true} />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">Loading meeting notes...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header showHistory={true} showLogout={true} />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-red-500">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!notes) {
    return (
      <div>
        <Header showHistory={true} showLogout={true} />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">No meeting notes found.</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
      minHeight: '100vh',
      paddingBottom: '100px'
    }}>
      <Header showHistory={true} showLogout={true} />
      
      <div style={{ marginTop: '100px' }} className="max-w-4xl mx-auto p-6">
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.8)',
          color: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }} className="bg-white rounded-lg shadow-lg p-6">
          <h1 style={{ color: 'white' }} className="text-2xl font-bold mb-6 text-center">Meeting Notes</h1>
          
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.5)',
            color: 'white'
          }} className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Meeting ID:</h2>
            <p className="text-gray-700">{notes.meetingId}</p>
          </div>
          
          <div className="mb-6">
            <h2 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }} className="text-xl font-bold mb-3 border-b pb-2">📝 Transcript</h2>
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.3)',
              color: 'white'
            }} className="p-4 bg-gray-50 rounded max-h-60 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">{notes.transcript}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }} className="text-xl font-bold mb-3 border-b pb-2">✅ Summary</h2>
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.3)',
              color: 'white'
            }} className="p-4 bg-gray-50 rounded">
              <p className="text-gray-700 whitespace-pre-wrap">{notes.summary}</p>
            </div>
          </div>
          
          {notes.actionItems && notes.actionItems.length > 0 && (
            <div className="mb-6">
              <h2 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }} className="text-xl font-bold mb-3 border-b pb-2">📌 Action Items</h2>
              <ul style={{ 
                background: 'rgba(30, 41, 59, 0.3)',
                color: 'white'
              }} className="list-disc pl-5 space-y-2 p-4 bg-gray-50 rounded">
                {notes.actionItems.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-sm text-gray-500 mt-6">
            <p>Created: {new Date(notes.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MeetingNotes;