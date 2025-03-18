'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function SimpleClientHome() {
  const [error, setError] = useState<string | null>('m.default is not a constructor');
  const [file, setFile] = useState<File | null>(null);
  
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  };
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    }
  });
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">TextBIMG</h1>
      
      <div 
        {...getRootProps()} 
        className="border-2 border-dashed border-blue-400 rounded-lg p-8 w-full max-w-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition-colors"
      >
        <input {...getInputProps()} />
        <div className="text-blue-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-center">Drop your image here<br />or click to browse files</p>
        <p className="text-xs text-gray-400 mt-2">Supported formats: PNG, JPG, JPEG, WEBP</p>
      </div>
      
      {file && (
        <div className="mt-4 text-green-400">
          Selected file: {file.name}
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
} 