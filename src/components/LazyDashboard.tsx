import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/lib/error-boundary';

// Lazy loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>

      {/* Date picker skeleton */}
      <div className="mb-6">
        <div className="h-10 bg-gray-200 rounded w-full max-w-sm"></div>
      </div>

      {/* Chart skeleton */}
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

// Error fallback for lazy-loaded components
function LazyErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-orange-500">⚠️</span>
        <h3 className="font-semibold text-orange-800">Component Loading Error</h3>
      </div>
      <p className="text-orange-600 text-sm mb-3">
        Failed to load dashboard component. This might be due to a network issue.
      </p>
      <button
        onClick={resetError}
        className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

// Generic lazy wrapper for dashboard components
export function createLazyDashboard<T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  displayName: string
) {
  const LazyComponent = lazy(importFn);
  
  const WrappedComponent = (props: T) => (
    <ErrorBoundary fallback={<LazyErrorFallback error={undefined} resetError={() => window.location.reload()} />}>
      <Suspense fallback={<DashboardSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `Lazy${displayName}`;
  return WrappedComponent;
}

// HOC for adding lazy loading to any component
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
) {
  const LazyWrapper = (props: P) => (
    <ErrorBoundary fallback={<LazyErrorFallback error={undefined} resetError={() => window.location.reload()} />}>
      <Suspense fallback={<DashboardSkeleton />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
  
  LazyWrapper.displayName = `withLazyLoading(${displayName || Component.displayName || Component.name})`;
  return LazyWrapper;
}

// Intersection Observer hook for lazy loading based on viewport
export function useInViewLazyLoad(threshold: number = 0.1) {
  const [inView, setInView] = React.useState(false);
  const [hasBeenInView, setHasBeenInView] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setHasBeenInView(true);
          // Once in view, we can disconnect the observer
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView, hasBeenInView };
}

// Viewport-based lazy loading component
export function ViewportLazyDashboard<T extends object>({
  component: Component,
  height = '400px',
  threshold = 0.1,
  ...props
}: {
  component: React.ComponentType<T>;
  height?: string;
  threshold?: number;
} & T) {
  const { ref, hasBeenInView } = useInViewLazyLoad(threshold);

  return (
    <div ref={ref} style={{ minHeight: height, width: '100%' }}>
      {hasBeenInView ? (
        <ErrorBoundary fallback={<LazyErrorFallback error={undefined} resetError={() => window.location.reload()} />}>
          <Suspense fallback={<DashboardSkeleton />}>
            <Component {...(props as T)} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <DashboardSkeleton />
      )}
    </div>
  );
}