import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import MeetingChat from './pages/MeetingChat';

function App() {
  return (
    <Router>
      <div className="min-h-screen text-slate-100 font-sans">
        <Toaster position="top-center" toastOptions={{ style: { background: '#334155', color: '#f8fafc' } }} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/meetings/:id" element={<MeetingChat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
