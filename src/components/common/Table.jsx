import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
      <table className={`w-full text-left text-xs ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }) {
  return <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200 ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = '', hover = true }) {
  const hoverStyle = hover ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors' : '';
  return <tr className={`${hoverStyle} ${className}`}>{children}</tr>;
}

export function TableHead({ children, className = '' }) {
  return <th className={`px-4 py-3 font-bold ${className}`}>{children}</th>;
}

export function TableCell({ children, className = '' }) {
  return <td className={`px-4 py-3 whitespace-nowrap ${className}`}>{children}</td>;
}

export default Table;
