"use client";

import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";

// Add image size limits and compression settings
const MAX_IMAGE_SIZE = 800; // Reduced maximum dimension for faster processing
const COMPRESSION_QUALITY = 0.6; // Slightly lower quality for faster processing

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(32);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [textBehind, setTextBehind] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Simplified onDrop function that just sets the original image
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setError(null);
      setIsProcessing(true);

      // Check file size before processing
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image is too large. Please use an image smaller than 10MB.');
        setIsProcessing(false);
        return;
      }

      // Convert file to data URL using a Promise
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            resolve(reader.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      
      setOriginalImage(dataUrl);
      setIsProcessing(false);
      
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    disabled: isProcessing
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return;
    
    setIsDragging(true);
    
    // Get image container dimensions and position
    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate position as percentage of container width/height
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setTextPosition({ x, y });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    // Get image container dimensions and position
    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate position as percentage of container width/height
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp values to stay within the image
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setTextPosition({ x: clampedX, y: clampedY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const downloadImage = useCallback(() => {
    if (!imageRef.current) return;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Failed to create canvas context');
      return;
    }
    
    // Create an image element to draw on canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // If text is behind, draw text first
      if (textBehind && text) {
        ctx.save();
        ctx.globalAlpha = textOpacity;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        
        // Calculate text position based on percentages
        const x = (textPosition.x / 100) * canvas.width;
        const y = (textPosition.y / 100) * canvas.height;
        
        ctx.fillText(text, x, y);
        ctx.restore();
      }
      
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);
      
      // If text is not behind, draw text after image
      if (!textBehind && text) {
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        
        // Calculate text position based on percentages
        const x = (textPosition.x / 100) * canvas.width;
        const y = (textPosition.y / 100) * canvas.height;
        
        ctx.fillText(text, x, y);
      }
      
      // Convert canvas to data URL and download
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'textbimg-processed.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Error creating download:', err);
        setError('Failed to create download');
      }
    };
    
    img.onerror = () => {
      setError('Failed to load image for processing');
    };
    
    img.src = originalImage as string;
  }, [originalImage, text, textColor, fontSize, textPosition, textBehind, textOpacity]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">TextBIMG</h1>
      
      {!originalImage ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed border-blue-400 rounded-lg p-8 w-full max-w-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="text-blue-400 mb-4">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          <p className="text-center">
            {isProcessing ? 'Processing...' : 'Drop your image here\nor click to browse files'}
          </p>
          <p className="text-xs text-gray-400 mt-2">Supported formats: PNG, JPG, JPEG, WEBP</p>
        </div>
      ) : (
        <div className="w-full max-w-xl">
          <div 
            ref={imageRef}
            className="relative aspect-video overflow-hidden rounded-lg mb-4 cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {text && textBehind && (
              <div 
                className="absolute pointer-events-none z-0"
                style={{
                  left: `${textPosition.x}%`,
                  top: `${textPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: textColor,
                  fontSize: `${fontSize}px`,
                  opacity: textOpacity,
                  whiteSpace: 'nowrap'
                }}
              >
                {text}
              </div>
            )}
            
            <img 
              src={originalImage} 
              alt="Uploaded image" 
              className="w-full h-full object-contain relative z-10"
            />
            
            {text && !textBehind && (
              <div 
                className="absolute pointer-events-none z-20"
                style={{
                  left: `${textPosition.x}%`,
                  top: `${textPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: textColor,
                  fontSize: `${fontSize}px`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap'
                }}
              >
                {text}
              </div>
            )}
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                placeholder="Enter text to add to image"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded mr-2"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 rounded text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Font Size</label>
                <input
                  type="range"
                  min="12"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center">{fontSize}px</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={textBehind}
                    onChange={(e) => setTextBehind(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-sm font-medium">Text Behind Image</span>
                </label>
              </div>
              
              {textBehind && (
                <div>
                  <label className="block text-sm font-medium mb-1">Text Opacity</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={textOpacity}
                    onChange={(e) => setTextOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center">{Math.round(textOpacity * 100)}%</div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-400 mb-2">Click and drag on the image to position the text</p>
          </div>
          
          <div className="flex justify-between">
            <button 
              onClick={() => setOriginalImage(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Upload a different image
            </button>
            <button 
              onClick={downloadImage}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Download Image
            </button>
          </div>
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