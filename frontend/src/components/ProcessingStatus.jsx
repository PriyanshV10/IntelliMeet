import React, { useEffect, useState } from 'react';
import { getMeeting } from '../services/api';
import { Loader2, CheckCircle, BrainCircuit } from 'lucide-react';

export default function ProcessingStatus({ meetingId, onReady }) {
  const [status, setStatus] = useState('PROCESSING');

  useEffect(() => {
    let interval;
    if (meetingId && status === 'PROCESSING') {
      interval = setInterval(async () => {
        try {
          const meeting = await getMeeting(meetingId);
          if (meeting.status === 'READY') {
            setStatus('READY');
            clearInterval(interval);
            setTimeout(() => onReady(), 1000); // Give user a second to see it's ready
          }
        } catch (e) {
          console.error("Failed to fetch status", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [meetingId, status, onReady]);

  return (
    <div className="glass-panel rounded-2xl p-12 max-w-xl mx-auto text-center space-y-6">
      <div className="relative inline-flex items-center justify-center">
        {status === 'PROCESSING' ? (
          <>
            <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="bg-slate-900 rounded-full p-6 relative">
              <BrainCircuit className="w-12 h-12 text-purple-400 animate-float" />
              <Loader2 className="w-24 h-24 text-purple-500/50 absolute inset-0 m-auto animate-spin" />
            </div>
          </>
        ) : (
          <div className="bg-green-500/20 rounded-full p-6 relative">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          {status === 'PROCESSING' ? 'AI is analyzing your meeting...' : 'Meeting Ready!'}
        </h2>
        <p className="text-slate-400 mt-2">
          {status === 'PROCESSING' 
            ? 'We are extracting transcripts, slides, and indexing everything into the knowledge base.' 
            : 'Taking you to the intelligence dashboard...'}
        </p>
      </div>
    </div>
  );
}
