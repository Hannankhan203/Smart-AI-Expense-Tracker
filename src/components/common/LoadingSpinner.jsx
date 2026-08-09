import React from 'react';

export default function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
  fullPage = false,
  className = '',
}) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center p-6 space-y-3 ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} border-emerald-200 dark:border-emerald-950 border-t-emerald-500 rounded-full animate-spin`}
      />
      {text && (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
}
