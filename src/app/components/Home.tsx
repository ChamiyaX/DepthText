"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { safeRemoveBackground } from '../utils/backgroundRemoval';

// Add image size limits and compression settings
const MAX_IMAGE_SIZE = 800; // Reduced maximum dimension for faster processing
const COMPRESSION_QUALITY = 0.6; // Slightly lower quality for faster processing

// Font options
const FONT_OPTIONS = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Courier New", value: "Courier New, monospace" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Impact", value: "Impact, sans-serif" },
];

// Text alignment options
const TEXT_ALIGN_OPTIONS = [
  { name: "Left", value: "left" },
  { name: "Center", value: "center" },
  { name: "Right", value: "right" },
];

// Depth effect options
const DEPTH_EFFECT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Behind Subject", value: "behind" },
  { name: "In Front of Subject", value: "front" },
  { name: "3D Effect", value: "3d" },
];

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [removedBgImage, setRemovedBgImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(32);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [textBehind, setTextBehind] = useState(true);
  const [textOpacity, setTextOpacity] = useState(1);
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
  const [textAlign, setTextAlign] = useState(TEXT_ALIGN_OPTIONS[1].value);
  const [textShadow, setTextShadow] = useState(false);
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textStroke, setTextStroke] = useState(false);
  const [textStrokeColor, setTextStrokeColor] = useState("#000000");
  const [textStrokeWidth, setTextStrokeWidth] = useState(1);
  const [depthEffect, setDepthEffect] = useState(DEPTH_EFFECT_OPTIONS[0].value);
  const [depthIntensity, setDepthIntensity] = useState(5);
  const [textScale, setTextScale] = useState(1);
  const [textRotation, setTextRotation] = useState(0);
  const [showOriginalLayer, setShowOriginalLayer] = useState(true);
  const [showTextLayer, setShowTextLayer] = useState(true);
  const [showForegroundLayer, setShowForegroundLayer] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  // Effect to handle 3D perspective on mouse move
  useEffect(() => {
    if (depthEffect !== '3d' || !imageRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!textRef.current || !imageRef.current) return;
      
      const rect = imageRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center (normalized from -1 to 1)
      const distanceX = (e.clientX - centerX) / (rect.width / 2);
      const distanceY = (e.clientY - centerY) / (rect.height / 2);
      
      // Apply 3D transform based on mouse position
      const intensity = depthIntensity * 5;
      const rotateY = distanceX * intensity;
      const rotateX = -distanceY * intensity;
      
      textRef.current.style.transform = `
        translate(-50%, -50%)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(${textScale})
      `;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [depthEffect, depthIntensity, textScale]);
  
  // Updated onDrop function to handle background removal
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setError(null);
      setIsProcessing(true);
      setProcessingProgress(0);

      // Check file size before processing
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image is too large. Please use an image smaller than 10MB.');
        setIsProcessing(false);
        return;
      }

      // Convert file to data URL for original image
      const originalUrl = await new Promise<string>((resolve, reject) => {
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
      
      setOriginalImage(originalUrl);
      setProcessingProgress(30);
      
      // Process background removal
      try {
        setError('Removing background... This may take a moment.');
        
        // Use the background removal utility
        const processedBlob = await safeRemoveBackground(file, {
          progress: (progress: number) => {
            // Map the progress from 0-100 to 30-90 (reserving 0-30 for initial loading)
            setProcessingProgress(30 + (progress * 0.6));
          },
          model: 'isnet',
          fetchArgs: { 
            cache: 'force-cache'
          },
          debug: false
        });
        
        // Convert the processed blob to a data URL
        const processedUrl = URL.createObjectURL(processedBlob);
        setRemovedBgImage(processedUrl);
        setProcessingProgress(100);
        setError(null);
      } catch (err) {
        console.error('Error in background removal:', err);
        setError('Background removal failed. Using original image instead.');
        // Still set the original image so the user can continue
        setRemovedBgImage(originalUrl);
      }
      
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

  // Get font style based on current settings
  const getFontStyle = useCallback(() => {
    let style = `${textBold ? 'bold ' : ''}${textItalic ? 'italic ' : ''}${fontSize}px ${fontFamily}`;
    return style;
  }, [fontSize, fontFamily, textBold, textItalic]);

  // Get text shadow style
  const getTextShadowStyle = useCallback(() => {
    return textShadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none';
  }, [textShadow]);

  // Get text style for preview with depth effect
  const getTextStyle = useCallback(() => {
    const baseStyle: any = {
      left: `${textPosition.x}%`,
      top: `${textPosition.y}%`,
      color: textColor,
      fontSize: `${fontSize}px`,
      fontFamily: fontFamily,
      fontWeight: textBold ? 'bold' : 'normal',
      fontStyle: textItalic ? 'italic' : 'normal',
      textAlign: textAlign,
      textShadow: getTextShadowStyle(),
      opacity: textBehind ? textOpacity : 1,
      whiteSpace: 'nowrap',
      WebkitTextStroke: textStroke ? `${textStrokeWidth}px ${textStrokeColor}` : 'none',
    };
    
    // Apply different transform based on depth effect
    if (depthEffect === '3d') {
      // 3D effect is handled by the useEffect
      baseStyle.transform = `translate(-50%, -50%) scale(${textScale})`;
      baseStyle.transition = 'transform 0.1s ease-out';
      baseStyle.transformStyle = 'preserve-3d';
      baseStyle.perspective = '1000px';
    } else if (depthEffect === 'behind') {
      // Behind subject effect
      baseStyle.transform = `translate(-50%, -50%) scale(${textScale}) rotate(${textRotation}deg)`;
      baseStyle.filter = `blur(${depthIntensity / 2}px)`;
      baseStyle.opacity = 0.8;
    } else if (depthEffect === 'front') {
      // In front of subject effect
      baseStyle.transform = `translate(-50%, -50%) scale(${textScale}) rotate(${textRotation}deg)`;
      baseStyle.textShadow = `0 0 ${depthIntensity}px rgba(0,0,0,0.5)`;
      baseStyle.zIndex = 30;
    } else {
      // No special effect
      baseStyle.transform = `translate(-50%, -50%) scale(${textScale}) rotate(${textRotation}deg)`;
    }
    
    return baseStyle;
  }, [
    textPosition, 
    textColor, 
    fontSize, 
    fontFamily, 
    textBold, 
    textItalic, 
    textAlign, 
    getTextShadowStyle, 
    textBehind, 
    textOpacity, 
    textStroke, 
    textStrokeWidth, 
    textStrokeColor,
    depthEffect,
    depthIntensity,
    textScale,
    textRotation
  ]);

  // Updated downloadImage function to handle the layered effect
  const downloadImage = useCallback(() => {
    if (!imageRef.current || !originalImage) return;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Failed to create canvas context');
      return;
    }
    
    // Create image elements for original and foreground
    const originalImg = new Image();
    originalImg.crossOrigin = 'anonymous';
    
    const foregroundImg = new Image();
    foregroundImg.crossOrigin = 'anonymous';
    
    // Set up the loading sequence
    originalImg.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = originalImg.width;
      canvas.height = originalImg.height;
      
      // Layer 1: Draw the original image if enabled
      if (showOriginalLayer) {
        ctx.drawImage(originalImg, 0, 0);
      } else {
        // Fill with black if original layer is disabled
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Layer 2: Draw the text if enabled
      if (showTextLayer && text) {
        ctx.save();
        
        // Apply text styling
        ctx.font = getFontStyle();
        ctx.fillStyle = textColor;
        ctx.textAlign = textAlign as CanvasTextAlign;
        
        // Calculate text position based on percentages
        const x = (textPosition.x / 100) * canvas.width;
        const y = (textPosition.y / 100) * canvas.height;
        
        // Apply depth effects to text
        if (depthEffect === 'behind') {
          ctx.globalAlpha = textOpacity * 0.8;
          ctx.filter = `blur(${depthIntensity / 2}px)`;
        } else if (depthEffect === 'front') {
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = depthIntensity;
        }
        
        // Apply text rotation and scaling
        ctx.translate(x, y);
        ctx.rotate(textRotation * Math.PI / 180);
        ctx.scale(textScale, textScale);
        
        // Add text stroke if enabled
        if (textStroke) {
          ctx.strokeStyle = textStrokeColor;
          ctx.lineWidth = textStrokeWidth;
          ctx.strokeText(text, 0, 0);
        }
        
        // Draw the text
        ctx.fillText(text, 0, 0);
        
        ctx.restore();
      }
      
      // Layer 3: Draw the foreground (removed background) image if enabled
      if (showForegroundLayer && removedBgImage) {
        foregroundImg.onload = () => {
          ctx.drawImage(foregroundImg, 0, 0, canvas.width, canvas.height);
          
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
        
        foregroundImg.onerror = () => {
          setError('Failed to load foreground image for processing');
          // Still try to download what we have
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'textbimg-processed.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        
        foregroundImg.src = removedBgImage;
      } else {
        // If foreground layer is disabled, download immediately
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'textbimg-processed.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    
    originalImg.onerror = () => {
      setError('Failed to load image for processing');
    };
    
    originalImg.src = originalImage;
  }, [
    originalImage, 
    removedBgImage, 
    text, 
    textColor, 
    fontSize, 
    textPosition, 
    textBehind, 
    textOpacity, 
    fontFamily, 
    textAlign, 
    textShadow, 
    textBold, 
    textItalic, 
    textStroke, 
    textStrokeColor, 
    textStrokeWidth,
    depthEffect,
    depthIntensity,
    textScale,
    textRotation,
    showOriginalLayer,
    showTextLayer,
    showForegroundLayer,
    getFontStyle
  ]);

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
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400">{Math.round(processingProgress)}%</div>
              </div>
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
            {/* Layer 1: Original image (background) */}
            {showOriginalLayer && (
              <img 
                src={originalImage} 
                alt="Original image" 
                className="absolute top-0 left-0 w-full h-full object-contain z-0"
              />
            )}
            
            {/* Layer 2: Text */}
            {showTextLayer && text && (
              <div 
                ref={textRef}
                className="absolute pointer-events-none z-10"
                style={getTextStyle()}
              >
                {text}
              </div>
            )}
            
            {/* Layer 3: Foreground (removed background) */}
            {showForegroundLayer && removedBgImage && (
              <img 
                src={removedBgImage} 
                alt="Foreground" 
                className="absolute top-0 left-0 w-full h-full object-contain z-20"
              />
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
            
            {/* Layer visibility controls */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOriginalLayer}
                  onChange={(e) => setShowOriginalLayer(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-sm font-medium">Background</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTextLayer}
                  onChange={(e) => setShowTextLayer(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-sm font-medium">Text</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showForegroundLayer}
                  onChange={(e) => setShowForegroundLayer(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-sm font-medium">Foreground</span>
              </label>
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
                <label className="block text-sm font-medium mb-1">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Text Align</label>
                <select
                  value={textAlign}
                  onChange={(e) => setTextAlign(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                >
                  {TEXT_ALIGN_OPTIONS.map((align) => (
                    <option key={align.value} value={align.value}>
                      {align.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setTextBold(!textBold)}
                className={`px-3 py-2 rounded ${textBold ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Bold
              </button>
              <button
                onClick={() => setTextItalic(!textItalic)}
                className={`px-3 py-2 rounded ${textItalic ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Italic
              </button>
              <button
                onClick={() => setTextShadow(!textShadow)}
                className={`px-3 py-2 rounded ${textShadow ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Shadow
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Depth Effect</label>
              <select
                value={depthEffect}
                onChange={(e) => setDepthEffect(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded text-white mb-2"
              >
                {DEPTH_EFFECT_OPTIONS.map((effect) => (
                  <option key={effect.value} value={effect.value}>
                    {effect.name}
                  </option>
                ))}
              </select>
              
              {depthEffect !== 'none' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Effect Intensity</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={depthIntensity}
                      onChange={(e) => setDepthIntensity(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center">{depthIntensity}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Scale</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={textScale}
                      onChange={(e) => setTextScale(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center">{textScale.toFixed(1)}x</div>
                  </div>
                </div>
              )}
              
              {depthEffect !== 'none' && depthEffect !== '3d' && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">Text Rotation</label>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={textRotation}
                    onChange={(e) => setTextRotation(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center">{textRotation}°</div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="flex items-center space-x-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={textStroke}
                    onChange={(e) => setTextStroke(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-sm font-medium">Text Outline</span>
                </label>
              </div>
              
              {textStroke && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Outline Color</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={textStrokeColor}
                        onChange={(e) => setTextStrokeColor(e.target.value)}
                        className="w-10 h-10 rounded mr-2"
                      />
                      <input
                        type="text"
                        value={textStrokeColor}
                        onChange={(e) => setTextStrokeColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 rounded text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Outline Width</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={textStrokeWidth}
                      onChange={(e) => setTextStrokeWidth(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center">{textStrokeWidth}px</div>
                  </div>
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