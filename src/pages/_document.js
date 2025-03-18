import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return ( <
        Html lang = "en" >
        <
        Head / >
        <
        body >
        <
        script dangerouslySetInnerHTML = {
            {
                __html: `
            // Fix for "m.default is not a constructor" error
            (function() {
              const originalDefineProperty = Object.defineProperty;
              Object.defineProperty = function(obj, prop, descriptor) {
                // Check if this is the problematic module
                if (prop === 'default' && descriptor && descriptor.value) {
                  // Make sure the default export is not used as a constructor
                  const originalValue = descriptor.value;
                  if (typeof originalValue === 'function') {
                    descriptor.value = function(...args) {
                      return originalValue(...args);
                    };
                  }
                }
                return originalDefineProperty(obj, prop, descriptor);
              };
              console.log('Constructor error prevention installed');
            })();
          `
            }
        }
        /> <
        Main / >
        <
        NextScript / >
        <
        /body> <
        /Html>
    );
}