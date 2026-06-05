import React from 'react';
import { Clock, FileText, LayoutTemplate } from 'lucide-react';

export default function CitationCard({ source }) {
  const metadata = source.metadata || {};
  const type = metadata.type || 'unknown';

  let icon = <FileText className="w-4 h-4 text-purple-400" />;
  let headerText = 'Source';

  if (type === 'transcript') {
    icon = <Clock className="w-4 h-4 text-blue-400" />;
    headerText = `Transcript - ${metadata.timestamp || 'Unknown Time'}`;
  } else if (type === 'slide') {
    icon = <LayoutTemplate className="w-4 h-4 text-pink-400" />;
    headerText = `Slide ${metadata.slide_number || '?'}`;
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm hover:bg-white/10 transition-colors cursor-pointer group mt-2">
      <div className="flex items-center space-x-2 mb-2 border-b border-white/10 pb-2">
        {icon}
        <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
          {headerText}
        </span>
        <span className="text-xs text-slate-500 ml-auto">
          Relevance: {Math.round((source.score || 0) * 100)}%
        </span>
      </div>
      <p className="text-slate-400 italic line-clamp-3 group-hover:line-clamp-none transition-all">
        "{source.text}"
      </p>
    </div>
  );
}
