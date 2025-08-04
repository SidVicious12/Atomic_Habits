import React, { Suspense } from 'react';
import { ErrorBoundary } from '../lib/error-boundary';
import InteractiveHero3D from '../components/ui/InteractiveHero3D';

// Loading fallback for 3D scene
function Hero3DLoader() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-white text-lg">Loading your atomic experience...</p>
        <p className="text-gray-400 text-sm">Initializing 3D scene</p>
      </div>
    </div>
  );
}

// Error fallback for 3D scene
function Hero3DError({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-white">3D Scene Error</h2>
        <p className="text-gray-300">
          Unable to load the 3D experience. Your device might not support WebGL.
        </p>
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
          <div className="text-sm text-gray-400">
            Or continue with the standard interface
          </div>
        </div>
      </div>
    </div>
  );
}

const Homepage: React.FC = () => {
  return (
    <ErrorBoundary fallback={<Hero3DError error={undefined} resetError={() => window.location.reload()} />}>
      <Suspense fallback={<Hero3DLoader />}>
        <InteractiveHero3D />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Homepage;