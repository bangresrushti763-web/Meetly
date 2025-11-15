import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Authentication from './pages/authentication';
import History from './pages/history';
import VideoMeet from './pages/VideoMeet';
import Landing from './pages/landing';
import MeetingNotes from './pages/MeetingNotes';
import withAuth from './utils/withAuth';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/history" element={withAuth(History)} />
          <Route path="/meeting/:meetingId" element={withAuth(VideoMeet)} />
          <Route path="/meeting" element={withAuth(VideoMeet)} />
          <Route path="/meeting-notes" element={withAuth(MeetingNotes)} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;