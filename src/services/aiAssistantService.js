import { generateFinancialInsight } from './geminiService';
import { getUserFinancialContext, formatFinancialContextForPrompt } from './aiContextService';

/**
 * AI Financial Assistant Service
 * Handles user interactions, system instructions, and communication with Gemini API.
 * Uses read-only financial data context without modifying any existing data.
 */

const SYSTEM_INSTRUCTION = `You are an expert AI Personal Financial Analysis Assistant integrated into the Smart Expense Tracker application.

YOUR PURPOSE & CAPABILITIES:
1. SPENDING SUMMARIES: Provide total spending breakdowns for current month, previous month, or overall logged expenses.
2. INCOME SUMMARIES: Analyze logged income sources and income totals.
3. SAVINGS ANALYSIS: Explain net savings (Total Income - Total Expenses) and savings rate percentage.
4. SPENDING BY CATEGORY: Highlight top spending categories and their percentage of overall expenses.
5. BUDGET PERFORMANCE: Report exact budget limits, spent amounts, remaining balances, usage percentages, and budget status (ON TRACK, AT LIMIT, OVER BUDGET).
6. MONTH-TO-MONTH COMPARISONS: Contrast current month spending/income with previous month data and explain key changes.
7. HIGH / UNUSUAL SPENDING IDENTIFICATION: Identify largest single expense transactions and potential overspending areas.
8. FINANCIAL TRENDS & ACTIONABLE ADVICE: Offer practical, encouraging budgeting recommendations and reduction strategies based on user spending patterns.

ABSOLUTE RULES & ACCURACY SAFEGUARDS:
- STRICT ACCURACY: You MUST ONLY use the real financial context provided below. Never invent, fabricate, or assume any numbers, dates, transactions, or budgets.
- USE ACTUAL BUDGET DATA: Always use the exact Budget Limit, Spent, Remaining, Usage percentage, and Status specified under "=== BUDGET PERFORMANCE & OVERRUN ALERTS ===". Do NOT assume a budget limit is $0 unless explicitly listed as $0.00 in the data.
- INSUFFICIENT DATA RULE: If requested data or a specific period comparison is missing or unavailable, state clearly: "I don't have enough data to answer that accurately." Do NOT guess.
- FINANCIAL ADVICE DISCLAIMER: You provide general financial education and budgeting suggestions based on user logs. You are an AI financial assistant, not a licensed financial advisor.
- PRIVACY & SECURITY: Do not ask for sensitive credentials, bank account passwords, or credit card numbers.
- FORMATTING: Format your responses with clean Markdown (bold text, bullet points, numbered lists, key metrics) for maximum clarity and readability.`;

/**
 * Queries the AI Financial Assistant with a user question and financial context.
 * 
 * @param {string} userId - Current authenticated user UID
 * @param {string} userQuestion - The question or prompt entered by the user
 * @param {Array<{role: string, parts: Array<{text: string}>}>} [chatHistory=[]] - Optional previous conversation history
 * @returns {Promise<{ answer: string, contextSummary: Object }>} AI response and summary context
 */
export const askAIAssistant = async (userId, userQuestion, chatHistory = []) => {
  if (!userId) {
    throw new Error('User authentication required.');
  }

  if (!userQuestion || !userQuestion.trim()) {
    throw new Error('Please provide a question for the AI Assistant.');
  }

  try {
    // 1. Fetch user's read-only financial context
    const financialContext = await getUserFinancialContext(userId);
    const formattedContextString = formatFinancialContextForPrompt(financialContext);

    // 2. Construct prompt combining user question with formatted financial context
    const promptWithContext = `CURRENT USER FINANCIAL DATA:
${formattedContextString}

USER QUESTION:
${userQuestion.trim()}

Please answer the user's question accurately using only the financial data above.`;

    // 3. Send request to Gemini API
    const answer = await generateFinancialInsight(promptWithContext, {
      systemInstruction: SYSTEM_INSTRUCTION
    });

    return {
      answer,
      contextSummary: financialContext.summary,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in AI Financial Assistant service:', error);
    if (error.message?.includes('API_KEY')) {
      throw new Error('Gemini API Key is missing or invalid. Please check your environment setup.');
    }
    throw new Error(error.message || 'Failed to communicate with AI Financial Assistant.');
  }
};

/**
 * Generates automated quick financial insights based on the user's current data.
 * 
 * @param {string} userId - Current authenticated user UID
 * @returns {Promise<string>} AI generated insights text
 */
export const getQuickFinancialInsights = async (userId) => {
  const prompt = "Based on my financial data, provide 3 brief, high-impact bullet points: 1) A key spending insight, 2) A budget alert or recommendation, 3) A positive financial observation or tip.";
  const result = await askAIAssistant(userId, prompt);
  return result.answer;
};
