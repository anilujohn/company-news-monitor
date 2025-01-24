// src/app/page.tsx
'use client';

import { CompanyNewsMonitor } from '../components/CompanyNewsMonitor';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  return (
    <div className="p-6 max-w-xl mx-auto mt-8 bg-red-50 rounded-lg border border-red-200">
      <h2 className="text-lg font-semibold text-red-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-red-600 mb-4">
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Investment News Monitor
              </h1>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            // Reset any state that might have caused the error
            window.location.reload();
          }}
        >
          <CompanyNewsMonitor />
        </ErrorBoundary>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-center text-sm text-gray-500">
              Investment News Monitor © {new Date().getFullYear()}
            </p>
            <div className="text-sm text-gray-500">
              Powered by Next.js and FastAPI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}