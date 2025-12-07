'use client'

import { Paperclip, X } from 'phosphor-react';
import { useRef, useState, useEffect } from 'react';

export interface UploadedFile {
  file: File;
  preview?: string; // For images
  id: string; // Unique identifier
}

interface FileUploadButtonProps {
  files: UploadedFile[];
  onFilesChanged: (files: UploadedFile[]) => void;
  maxFileSize?: number; // in bytes, default 5MB
  maxTotalSize?: number; // in bytes, default 20MB
  acceptedTypes?: string; // e.g., "image/*,.pdf,.doc,.docx"
  language?: 'en' | 'nl';
}

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB

export function FileUploadButton({
  files,
  onFilesChanged,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  maxTotalSize = DEFAULT_MAX_TOTAL_SIZE,
  acceptedTypes = 'image/*,.pdf,.doc,.docx,.txt',
  language = 'en',
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      upload: 'Upload file',
      remove: 'Remove file',
      fileTooLarge: 'File is too large',
      totalSizeExceeded: 'Total file size exceeded',
      maxFileSize: 'Max file size:',
      maxTotalSize: 'Max total size:',
      files: 'files',
    },
    nl: {
      upload: 'Bestand uploaden',
      remove: 'Bestand verwijderen',
      fileTooLarge: 'Bestand is te groot',
      totalSizeExceeded: 'Totale bestandsgrootte overschreden',
      maxFileSize: 'Max bestandsgrootte:',
      maxTotalSize: 'Max totale grootte:',
      files: 'bestanden',
    },
  };

  const t = translations[language];

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    const newFiles: UploadedFile[] = [];
    let totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

    for (const file of selectedFiles) {
      // Check individual file size
      if (file.size > maxFileSize) {
        setError(`${t.fileTooLarge} (${file.name}): ${formatFileSize(file.size)} > ${formatFileSize(maxFileSize)}`);
        continue;
      }

      // Check total size
      if (totalSize + file.size > maxTotalSize) {
        setError(`${t.totalSizeExceeded} (${formatFileSize(maxTotalSize)})`);
        continue;
      }

      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      newFiles.push({
        file,
        preview,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      });

      totalSize += file.size;
    }

    if (newFiles.length > 0) {
      onFilesChanged([...files, ...newFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleRemoveFile(id: string) {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    onFilesChanged(files.filter(f => f.id !== id));
    setError(null);
  }

  // Cleanup object URLs when files are removed or component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]); // Cleanup when files change or component unmounts

  function handleButtonClick() {
    fileInputRef.current?.click();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          className="p-2 bg-zinc-800 rounded-md border-transparent hover:bg-zinc-700
             transitions-colors focus:outline-none focus:ring-2
             focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-brand-500"
          onClick={handleButtonClick}
          title={t.upload}
        >
          <Paperclip weight="bold" className="w-6 h-6" />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />

        {files.map((uploadedFile) => (
          <div
            key={uploadedFile.id}
            className="flex items-center gap-1 bg-zinc-800 rounded-md px-2 py-1 text-xs"
          >
            {uploadedFile.preview ? (
              <img
                src={uploadedFile.preview}
                alt={uploadedFile.file.name}
                className="w-6 h-6 object-cover rounded"
              />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
            <span className="text-zinc-300 max-w-[100px] truncate" title={uploadedFile.file.name}>
              {uploadedFile.file.name}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveFile(uploadedFile.id)}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
              title={t.remove}
            >
              <X weight="bold" className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      
      {files.length > 0 && (
        <p className="text-xs text-zinc-400">
          {files.length} {t.files} ({formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))} / {formatFileSize(maxTotalSize)})
        </p>
      )}
    </div>
  );
}
