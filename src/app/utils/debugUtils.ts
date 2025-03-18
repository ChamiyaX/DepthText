// Debug utility to help identify constructor errors
export function setupErrorDebugger() {
  if (typeof window !== 'undefined') {
    // Save the original Error constructor
    const originalError = window.Error;
    
    // Override Error to log stack traces
    window.Error = function(message) {
      const error = new originalError(message);
      if (message && message.includes('is not a constructor')) {
        console.error('CONSTRUCTOR ERROR DETECTED:', message);
        console.error('Stack trace:', error.stack);
      }
      return error;
    } as any;
    
    // Preserve prototype chain
    window.Error.prototype = originalError.prototype;
    
    console.log('Error debugger installed');
  }
} 