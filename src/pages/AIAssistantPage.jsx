import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import AIAssistantChat from '../components/ai/AIAssistantChat';
import { Sparkles, Bot } from 'lucide-react';

export default function AIAssistantPage() {
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              AI Financial Assistant
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3 h-3" /> Smart Analysis
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Get intelligent, real-time insights into your expenses, income, and budgets powered by Gemini 2.5 Flash.
          </p>
        </div>
      </div>

      <AIAssistantChat />
    </MainLayout>
  );
}
