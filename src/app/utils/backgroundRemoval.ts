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

// Simplified background removal utility
export async function safeRemoveBackground(file: File, options: any = {}) {
  try {
    // Try the simplest approach first
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      return await removeBackground(file, {
        ...options,
        model: 'fast', // Always use the fastest model
        fetchArgs: { 
          cache: 'force-cache'
        }
      });
    } catch (error) {
      console.error('Background removal failed:', error);
      
      // Just return the original image as fallback
      return file;
    }
  } catch (error) {
    console.error('All background removal methods failed:', error);
    return file;
  }
} 