import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { askQuestion, getQueryHistory } from '../services/api';
import ChatMessage from '../components/ChatMessage';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MeetingChat() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load chat history
    const loadHistory = async () => {
      try {
        const history = await getQueryHistory(id);
        // History from Spring Boot is an array of QueryMessage
        // We map them to an array of objects that ChatMessage expects
        const formattedMessages = history.map(msg => ({
          id: msg.id,
          question: msg.question,
          answer: msg.answer,
          sources: [] // We didn't persist sources in DB, so it's empty for history
        }));
        setMessages(formattedMessages);
      } catch (e) {
        console.error("Failed to load history", e);
        toast.error("Failed to load chat history.");
      }
    };
    loadHistory();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const question = input.trim();
    setInput('');
    
    // Optimistic UI update for the user's question
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, question, answer: null, isPending: true }]);
    setIsTyping(true);

    try {
      const response = await askQuestion(id, question);
      // Replace the pending message with the actual response
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? {
          id: response.message.id,
          question: response.message.question,
          answer: response.message.answer,
          sources: response.sources
        } : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? {
          ...msg,
          answer: "Sorry, I couldn't connect to the AI Service. Please ensure FastAPI is running."
        } : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
      
      {/* Header */}
      <header className="glass-panel border-b border-white/10 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </Link>
            <div>
              <h1 className="font-bold text-lg flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Meeting Intelligence</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">ID: {id}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth z-10">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && !isTyping && (
            <div className="h-full flex flex-col items-center justify-center text-center mt-32 space-y-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold">Ask anything about this meeting</h2>
              <p className="text-slate-400 max-w-md">
                Try asking about specific decisions, action items, or what a certain person said.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              {/* User Question */}
              <ChatMessage message={msg} isUser={true} />
              
              {/* AI Answer */}
              {msg.isPending ? (
                 <div className="flex w-full space-x-4 mb-6 justify-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="glass-panel rounded-2xl rounded-bl-none px-6 py-4 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                 </div>
              ) : (
                <ChatMessage message={msg} isUser={false} />
              )}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/10 z-10 relative">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-white/5 border border-white/10 focus:border-purple-500 rounded-2xl pl-6 pr-14 py-4 outline-none transition-colors shadow-inner"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">AI can make mistakes. Verify citations.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
