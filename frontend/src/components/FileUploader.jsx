import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function FileUploader({ onFilesSelected }) {
  const [files, setFiles] = React.useState({ audio: null, pdf: null, video: null });

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = { ...files };
    acceptedFiles.forEach((file) => {
      if (file.type.startsWith('audio/')) newFiles.audio = file;
      else if (file.type === 'application/pdf') newFiles.pdf = file;
      else if (file.type.startsWith('video/')) newFiles.video = file;
    });
    setFiles(newFiles);
    onFilesSelected(newFiles);
  }, [files, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (type) => {
    const newFiles = { ...files, [type]: null };
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div 
        {...getRootProps()} 
        className={cn(
          "glass-panel rounded-2xl p-12 text-center cursor-pointer transition-all duration-300",
          isDragActive ? "border-purple-500 bg-purple-500/10 scale-105" : "hover:bg-white/10"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-purple-500/20 rounded-full">
            <UploadCloud className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold">Drag & drop meeting files here</h3>
          <p className="text-slate-400">Support for .mp3, .mp4, and .pdf</p>
        </div>
      </div>

      {(files.audio || files.pdf || files.video) && (
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <h4 className="font-semibold text-lg border-b border-white/10 pb-2">Selected Files</h4>
          {Object.entries(files).map(([type, file]) => file && (
            <div key={type} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileIcon className="text-purple-400" size={20} />
                <span className="truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                <span className="text-xs px-2 py-1 bg-white/10 rounded-full uppercase">{type}</span>
              </div>
              <button onClick={() => removeFile(type)} className="text-slate-400 hover:text-red-400">
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
