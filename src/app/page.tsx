import ErrorBoundary from './components/ErrorBoundary';
import ClientHome from './components/ClientHome';

export default function Page() {
  return (
    <ErrorBoundary>
      <ClientHome />
    </ErrorBoundary>
  );
}
