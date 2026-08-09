import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAppContext, CURRENCY_MAP } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { updateUserSettingsData, getUserProfile } from '../services/authService';
import { Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  Monitor,
  DollarSign,
  Bell,
  Shield,
  Clock,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Lock,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Database,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme, currency, setCurrency } = useAppContext();
  const { addToast } = useToast();

  // Settings state
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState('Credit Card');
  const [sessionTimeout, setSessionTimeout] = useState('30 mins');
  const [savingSettings, setSavingSettings] = useState(false);

  // Load existing user settings from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    getUserProfile(user.uid).then((profile) => {
      if (profile?.settings) {
        const s = profile.settings;
        if (s.theme) setTheme(s.theme);
        if (s.currency) setCurrency(s.currency);
        if (s.budgetAlerts !== undefined) setBudgetAlerts(s.budgetAlerts);
        if (s.emailDigest !== undefined) setEmailDigest(s.emailDigest);
        if (s.autoSync !== undefined) setAutoSync(s.autoSync);
        if (s.defaultPaymentMethod) setDefaultPaymentMethod(s.defaultPaymentMethod);
        if (s.sessionTimeout) setSessionTimeout(s.sessionTimeout);
      }
    });
  }, [user]);

  // Handle Save Preferences
  const handleSavePreferences = async () => {
    if (!user?.uid) return;
    setSavingSettings(true);

    const settingsPayload = {
      theme,
      currency,
      budgetAlerts,
      emailDigest,
      autoSync,
      defaultPaymentMethod,
      sessionTimeout,
    };

    try {
      await updateUserSettingsData(user.uid, settingsPayload);
      addToast({
        title: 'Settings Saved',
        message: 'Your system preferences have been saved to your account.',
        type: 'success',
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      addToast({
        title: 'Save Failed',
        message: 'Could not save settings. Please try again.',
        type: 'error',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Application Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Customize appearance themes, currency formatting, security policies, and sync options.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSavePreferences}
            loading={savingSettings}
            className="text-xs self-start sm:self-auto"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Save Preferences
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Theme & Appearance */}
          <Card
            title="Appearance & Theme"
            subtitle="Choose your preferred interface display mode"
          >
            <div className="space-y-4 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Interface Theme
              </label>

              <div className="grid grid-cols-3 gap-3">
                {/* Light Option */}
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    theme === 'light'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Sun className="w-6 h-6 text-amber-500" />
                  <span className="text-xs">Light Mode</span>
                </button>

                {/* Dark Option */}
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    theme === 'dark'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Moon className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs">Dark Mode</span>
                </button>

                {/* System Option */}
                <button
                  type="button"
                  onClick={() => {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setTheme(prefersDark ? 'dark' : 'light');
                  }}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-300`}
                >
                  <Monitor className="w-6 h-6 text-emerald-500" />
                  <span className="text-xs">System Default</span>
                </button>
              </div>
            </div>
          </Card>

          {/* 2. Currency Preference */}
          <Card
            title="Currency & Locale"
            subtitle="Set your preferred currency symbol for all monetary views"
          >
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {Object.values(CURRENCY_MAP).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Currency symbol format applies across Dashboard, Reports, Expenses, and Income tables.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Default Payment Method for Expenses
                </label>
                <select
                  value={defaultPaymentMethod}
                  onChange={(e) => setDefaultPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </Card>

          {/* 3. Account & Notifications Settings */}
          <Card
            title="Account & Notifications"
            subtitle="Configure automated alerts and synchronization policies"
          >
            <div className="space-y-4 pt-1">
              {/* Toggle 1: Budget Overlimit Alerts */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Budget Overlimit Warnings
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Show in-app warning banners when spending exceeds 85% of budget cap
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={budgetAlerts}
                    onChange={(e) => setBudgetAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

              {/* Toggle 2: Realtime Firestore Sync */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Real-Time Firestore Auto-Sync
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Stream background collection updates instantly using onSnapshot listeners
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

              {/* Toggle 3: Email Monthly Summary */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Monthly Email Financial Summary
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Send monthly expense reports and savings breakdowns to registered email
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>
            </div>
          </Card>

          {/* 4. Security & Access Control Settings */}
          <Card
            title="Security Settings"
            subtitle="Manage session timeouts and authentication security"
          >
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Auto Session Timeout
                </label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="15 mins">15 Minutes Inactivity</option>
                  <option value="30 mins">30 Minutes Inactivity</option>
                  <option value="1 hour">1 Hour Inactivity</option>
                  <option value="Never">Never (Keep Signed In)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Security Credentials
                  </span>
                  <Badge variant="emerald" size="sm">
                    Protected
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  Password re-authentication is required before sensitive account modifications or account deletion.
                </p>
                <div className="pt-1">
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    <span>Manage Password in Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
