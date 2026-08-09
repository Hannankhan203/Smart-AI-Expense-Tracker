import React from 'react';

export default function ChartPlaceholder({ title = 'Financial Visualizer', height = 'h-64' }) {
  return (
    <div className={`w-full ${height} border border-dashed border-slate-300 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/50`}>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-[11px] text-slate-400 mt-1">Chart visualization engine ready</p>
    </div>
  );
}
