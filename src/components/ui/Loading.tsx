import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  text,
  className = "",
  fullScreen = false,
  overlay = false,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const LoadingContent = () => (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <LoadingContent />
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-white bg-opacity-90">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

const Spinner: React.FC<SpinnerProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
};

const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  lines = 1,
  avatar = false,
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            {index === lines - 1 && lines > 1 && (
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  className = "",
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div
        className="grid gap-4 mb-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div
            key={`header-${index}`}
            className="h-4 bg-gray-300 rounded"
          ></div>
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="h-4 bg-gray-200 rounded"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  count = 3,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-gray-300 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6"></div>
            </div>

            <div className="mt-6 flex space-x-3">
              <div className="h-8 bg-gray-300 rounded w-20"></div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface UseLoadingReturn {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

const useLoading = (initialState = false): UseLoadingReturn => {
  const [loading, setLoading] = React.useState(initialState);

  const withLoading = React.useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
};

export { Loading, Spinner, Skeleton, TableSkeleton, CardSkeleton, useLoading };

export type {
  LoadingProps,
  SpinnerProps,
  SkeletonProps,
  TableSkeletonProps,
  CardSkeletonProps,
  UseLoadingReturn,
};
