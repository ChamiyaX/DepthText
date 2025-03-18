// This file will be included in the HTML to help debug
console.log('TextBIMG Debug Mode Enabled');

// Override the Error constructor to catch constructor errors
const originalError = Error;
window.Error = function(message) {
    const error = new originalError(message);
    if (message && typeof message === 'string' && message.includes('constructor')) {
        console.error('CONSTRUCTOR ERROR:', message);
        console.error('STACK:', error.stack);
    }
    return error;
};
window.Error.prototype = originalError.prototype;

// Monitor for specific modules
const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function(obj, prop, descriptor) {
    if (prop === 'default' && descriptor && descriptor.value) {
        console.log('Module default property defined:', descriptor.value);
    }
    return originalDefineProperty(obj, prop, descriptor);
};