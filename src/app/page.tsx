import ErrorBoundary from './components/ErrorBoundary';
import SimpleClientHome from './components/SimpleClientHome';
import { setupErrorDebugger } from './utils/debugUtils';

// This is a client component wrapper to set up debugging
'use client';
import { useEffect } from 'react';

function DebugWrapper({ children }: { children: React.ReactNode }) {
  // Set up error debugger on mount
  useEffect(() => {
    setupErrorDebugger();
  }, []);
  
  return <>{children}</>;
}

export default function Page() {
  return (
    <DebugWrapper>
      <ErrorBoundary>
        <SimpleClientHome />
      </ErrorBoundary>
    </DebugWrapper>
  );
}
