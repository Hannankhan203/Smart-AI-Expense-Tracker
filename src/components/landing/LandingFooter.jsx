import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">
                SmartExpense
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Modern personal financial dashboard for expense tracking, income analytics, and intelligent budgeting.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Live Dashboard
                </Link>
              </li>
              <li>
                <Link to="/expenses" className="hover:text-emerald-400 transition-colors">
                  Expenses Ledger
                </Link>
              </li>
              <li>
                <Link to="/income" className="hover:text-emerald-400 transition-colors">
                  Income Tracker
                </Link>
              </li>
              <li>
                <Link to="/budgets" className="hover:text-emerald-400 transition-colors">
                  Budget Planner
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-emerald-400 transition-colors">
                  Financial Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Auth */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Account
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-emerald-400 transition-colors">
                  Reset Password
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-emerald-400 transition-colors">
                  User Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-emerald-400 transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* System Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Firebase Firestore V9</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>React 18 + Vite</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Tailwind CSS Engine</span>
              </li>
            </ul>

            <div className="flex items-center gap-3 mt-4 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-900 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-900 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-900 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} SmartExpense Tracker. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with precision for personal wealth control</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
