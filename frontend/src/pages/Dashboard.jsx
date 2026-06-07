import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllMeetings } from '../services/api';
import { Sparkles, Plus, Calendar, Clock, BrainCircuit, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const data = await getAllMeetings();
        setMeetings(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load meetings.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'READY': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'PROCESSING': return <BrainCircuit className="w-4 h-4 text-purple-400 animate-pulse" />;
      default: return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 space-y-4 md:space-y-0">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-200 uppercase tracking-wider">Dashboard</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Your Meetings</h1>
          </div>
          <Link 
            to="/upload" 
            className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-500/25 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Meeting</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <BrainCircuit className="w-12 h-12 text-purple-500 animate-pulse" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center border border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No meetings yet</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Upload your first meeting recording or slides to start extracting insights with AI.</p>
            <Link to="/upload" className="text-purple-400 hover:text-purple-300 font-medium">Upload a meeting &rarr;</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <Link 
                to={`/meetings/${meeting.id}`} 
                key={meeting.id}
                className="group glass-panel rounded-2xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer border border-white/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                    {meeting.title}
                  </h3>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-slate-400">
                    <Calendar className="w-4 h-4 mr-2 opacity-70" />
                    {formatDate(meeting.createdAt)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 opacity-70" />
                      <span>{meeting.durationSeconds ? `${Math.round(meeting.durationSeconds / 60)} min` : 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(meeting.status)}
                    <span className="text-xs uppercase tracking-wider text-slate-300 font-medium">
                      {meeting.status}
                    </span>
                  </div>
                  <span className="text-xs text-purple-400 group-hover:underline">Open Chat &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
