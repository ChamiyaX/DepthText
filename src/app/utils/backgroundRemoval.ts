// This file provides a safe wrapper around the background removal library
import { createWorker } from '@imgly/background-removal';

// Keep track of the worker instance
let workerInstance: any = null;

// Function to safely load the module and create a worker
export async function getBackgroundRemovalWorker() {
  if (workerInstance) return workerInstance;
  
  try {
    // Only create worker on client side
    if (typeof window !== 'undefined') {
      // Create a worker with more robust error handling
      workerInstance = await createWorker({
        // Use a CDN-hosted model for better reliability
        model: 'medium', // Use medium model for balance of speed and quality
        progress: () => {}, // Empty progress function by default
        debug: false,
        proxyToWorker: true, // This helps with memory issues
        fetchArgs: {
          cache: 'force-cache'
        }
      });
      return workerInstance;
    }
    throw new Error('Background removal only works in browser');
  } catch (error) {
    console.error('Failed to create background removal worker:', error);
    throw error;
  }
}

// Safe wrapper function with fallback
export async function safeRemoveBackground(file: File, options: any = {}) {
  try {
    // Try to use the @imgly/background-removal library
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      return await removeBackground(file, options);
    } catch (primaryError) {
      console.error('Primary background removal method failed:', primaryError);
      
      // Fallback to worker-based approach
      try {
        const worker = await getBackgroundRemovalWorker();
        const arrayBuffer = await file.arrayBuffer();
        const result = await worker.remove(new Uint8Array(arrayBuffer), {
          progress: options.progress,
          model: options.model || 'medium'
        });
        
        // Convert result to blob
        return new Blob([result], { type: 'image/png' });
      } catch (workerError) {
        console.error('Worker-based background removal failed:', workerError);
        throw workerError;
      }
    }
  } catch (error) {
    console.error('All background removal methods failed:', error);
    
    // Create a fallback that just returns the original image
    // This ensures the app doesn't crash even if background removal fails
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise<Blob>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create fallback image'));
            }
          },
          'image/png'
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image for fallback'));
      img.src = URL.createObjectURL(file);
    });
  }
} 