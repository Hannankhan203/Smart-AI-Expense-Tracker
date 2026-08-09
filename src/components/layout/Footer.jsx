import React from 'react';

export default function Footer() {
  return (
    <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>© 2026 Smart Expense Tracker. All rights reserved.</p>
      <div className="flex items-center gap-4 text-slate-400">
        <span>Privacy Policy</span>
        <span>•</span>
        <span>Terms of Service</span>
        <span>•</span>
        <span>Security</span>
      </div>
    </footer>
  );
}
