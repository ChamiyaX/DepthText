// This file provides a safe wrapper around the background removal library

// Import the library directly (no dynamic import)
let removeBackgroundFunc: any = null;

// Function to safely load the module
export async function loadBackgroundRemovalModule() {
  if (removeBackgroundFunc) return removeBackgroundFunc;
  
  try {
    // Only import on client side
    if (typeof window !== 'undefined') {
      const module = await import('@imgly/background-removal');
      if (module && typeof module.removeBackground === 'function') {
        removeBackgroundFunc = module.removeBackground;
        return removeBackgroundFunc;
      }
    }
    throw new Error('Background removal module not available');
  } catch (error) {
    console.error('Failed to load background removal module:', error);
    throw error;
  }
}

// Safe wrapper function
export async function safeRemoveBackground(file: File, options: any = {}) {
  try {
    const removeBackground = await loadBackgroundRemovalModule();
    if (!removeBackground) {
      throw new Error('Background removal function not available');
    }
    return await removeBackground(file, options);
  } catch (error) {
    console.error('Error in safeRemoveBackground:', error);
    throw error;
  }
} 