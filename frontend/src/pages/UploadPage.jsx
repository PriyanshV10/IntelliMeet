import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import ProcessingStatus from '../components/ProcessingStatus';
import { uploadMeeting } from '../services/api';
import { Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [files, setFiles] = useState({});
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [meetingId, setMeetingId] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!title || (!files.audio && !files.pdf && !files.video)) return;
    
    setIsUploading(true);
    const toastId = toast.loading('Uploading files...');
    try {
      const result = await uploadMeeting(title, files.audio, files.pdf, files.video);
      toast.success('Upload complete! AI processing started.', { id: toastId });
      setMeetingId(result.id); // Assuming backend returns { id: "uuid..." }
    } catch (e) {
      console.error(e);
      toast.error('Failed to upload meeting.', { id: toastId });
      setIsUploading(false);
    }
  };

  if (meetingId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <ProcessingStatus 
          meetingId={meetingId} 
          onReady={() => navigate(`/meetings/${meetingId}`)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-200">IntelliMeet AI Assistant</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Bring your meetings <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
              to life with AI.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Upload your audio, video, or slides. We'll transcribe, index, and make everything instantly searchable.
          </p>
        </div>

        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Meeting Title</label>
            <input 
              type="text" 
              placeholder="e.g. Q3 Product Roadmap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-purple-500 rounded-xl px-4 py-3 outline-none transition-colors"
            />
          </div>

          <FileUploader onFilesSelected={setFiles} />

          <button 
            onClick={handleUpload}
            disabled={!title || (!files.audio && !files.pdf && !files.video) || isUploading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-purple-500/25"
          >
            <span>{isUploading ? 'Uploading...' : 'Process Meeting'}</span>
            {!isUploading && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
