import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  Send,
  Trash2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { askAIAssistant, getQuickFinancialInsights } from '../../services/aiAssistantService';
import { getUserFinancialContext } from '../../services/aiContextService';
import Button from '../common/Button';
import Card from '../common/Card';

const SUGGESTED_QUESTIONS = [
  'How much did I spend this month?',
  'What is my biggest spending category?',
  'Where am I overspending?',
  'How much did I save this month?',
  'How am I doing with my budget?',
  'Give me a summary of my finances.',
  'Compare my spending with last month.',
];

export default function AIAssistantChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contextSummary, setContextSummary] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load user financial context on initial render
  useEffect(() => {
    const loadSummary = async () => {
      if (!user?.uid) return;
      try {
        setLoadingContext(true);
        const data = await getUserFinancialContext(user.uid);
        setContextSummary(data.summary);
      } catch (err) {
        console.error('Failed to load financial context:', err);
      } finally {
        setLoadingContext(false);
      }
    };
    loadSummary();
  }, [user]);

  // Handle sending a user question
  const handleSendQuestion = async (questionText) => {
    const query = questionText || inputQuestion;
    if (!query || !query.trim() || loading || !user?.uid) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setError(null);
    setLoading(true);

    try {
      const response = await askAIAssistant(user.uid, query.trim());
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (response.contextSummary) {
        setContextSummary(response.contextSummary);
      }
    } catch (err) {
      console.error('Error asking AI Assistant:', err);
      setError(err.message || 'Failed to generate response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle quick auto-insights trigger
  const handleQuickInsights = async () => {
    handleSendQuestion('Give me a summary of my finances.');
  };

  // Clear chat conversation
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Income
              </p>
              <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {loadingContext ? '...' : `$${(contextSummary?.totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-amber-500/5 border-rose-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Expenses
              </p>
              <h4 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {loadingContext ? '...' : `$${(contextSummary?.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-sky-500/5 border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Net Savings / Balance
              </p>
              <h4 className={`text-xl font-bold mt-1 ${(contextSummary?.netSavings || 0) >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {loadingContext ? '...' : `$${(contextSummary?.netSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Chat Interface Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  AI Financial Assistant
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time read-only analysis of your live financial data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                icon={Trash2}
                className="text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            /* Empty State / Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4 shadow-xs">
                <Bot className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Ask your AI Financial Assistant
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                I can analyze your income, expenses, budgets, and spending habits to give you personalized insights without altering your data.
              </p>

              {/* Quick Prompt Cards */}
              <div className="w-full mt-6 space-y-2 text-left">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                  Suggested Questions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      disabled={loading}
                      onClick={() => handleSendQuestion(q)}
                      className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-700/60 p-3 rounded-xl transition-all flex items-start justify-between group text-left disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <span>{q}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-emerald-500 mt-0.5 ml-2 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages Thread */
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-slate-800 text-white dark:bg-slate-700'
                      : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Box */}
                <div className="space-y-1 max-w-xl">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {/* Render message lines with spacing */}
                    <div className="whitespace-pre-wrap break-words space-y-1">
                      {msg.text}
                    </div>
                  </div>
                  <p
                    className={`text-[10px] text-slate-400 dark:text-slate-500 px-1 ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 p-4 rounded-2xl rounded-tl-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Analyzing your financial data...
                </span>
              </div>
            </div>
          )}

          {/* Error Message Box */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setError(null)}
                className="text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
              >
                Dismiss
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Question Chips above Input (Visible when messages exist) */}
        {messages.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto whitespace-nowrap flex items-center gap-2 shrink-0 no-scrollbar">
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Quick:
            </span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSendQuestion(q)}
                className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full transition-colors shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask anything about your expenses, budgets, savings, or categories..."
              disabled={loading}
              className="flex-1 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs rounded-xl px-4 py-3 border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all"
            />
            <Button
              type="submit"
              disabled={!inputQuestion.trim() || loading}
              loading={loading}
              icon={Send}
              className="px-5 py-3 rounded-xl shrink-0"
            >
              Ask AI
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
