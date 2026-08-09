import { GoogleGenAI } from '@google/genai';

/**
 * AI Financial Assistant Gemini Configuration & Service
 * Reads VITE_GEMINI_API_KEY and VITE_GEMINI_MODEL.
 */

const getEnvVar = (name) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
    return import.meta.env[name];
  }
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  return '';
};

export const GEMINI_MODEL = getEnvVar('VITE_GEMINI_MODEL') === 'gemini-2.5-flash' 
  ? 'gemini-3.6-flash' 
  : (getEnvVar('VITE_GEMINI_MODEL') || 'gemini-3.6-flash');

/**
 * Returns an instance of GoogleGenAI initialized with VITE_GEMINI_API_KEY.
 * Never logs or prints the secret key.
 */
export const getGeminiClient = () => {
  let apiKey = (getEnvVar('VITE_GEMINI_API_KEY') || '').trim();

  if (!apiKey) {
    apiKey = (getEnvVar('VITE_FIREBASE_API_KEY') || '').trim();
  }

  if (!apiKey) {
    console.warn('Gemini API Key (VITE_GEMINI_API_KEY) is missing or empty.');
  }

  return new GoogleGenAI({ apiKey });
};

/**
 * Helper method to generate AI content using configured model
 * @param {string} prompt - Prompt or formatted financial context
 * @param {Object} [options] - Additional config options
 * @returns {Promise<string>}
 */
export const generateFinancialInsight = async (prompt, options = {}) => {
  let apiKey = (getEnvVar('VITE_GEMINI_API_KEY') || '').trim();

  if (!apiKey) {
    apiKey = (getEnvVar('VITE_FIREBASE_API_KEY') || '').trim();
  }

  if (!apiKey) {
    throw new Error('Gemini API Key is missing or empty. Please check your VITE_GEMINI_API_KEY environment setup.');
  }

  let model = getEnvVar('VITE_GEMINI_MODEL') || 'gemini-3.6-flash';
  if (model === 'gemini-2.5-flash') {
    model = 'gemini-3.6-flash';
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: options.systemInstruction ? {
        systemInstruction: options.systemInstruction
      } : undefined
    });

    if (response?.text && response.text.trim()) {
      return response.text;
    }
    throw new Error('The AI model returned an empty response. Please rephrase your question.');
  } catch (error) {
    console.error('Gemini API call failed:', error?.message || error);

    // Rate limits / quota limits (HTTP 429 / RESOURCE_EXHAUSTED)
    if (
      error?.status === 429 ||
      error?.message?.includes('429') ||
      error?.message?.includes('RESOURCE_EXHAUSTED') ||
      error?.message?.includes('Quota exceeded')
    ) {
      throw new Error('Gemini API rate limit or free quota exceeded. Please wait a moment and try asking again.');
    }

    // Invalid API Key / Forbidden (HTTP 403 / PERMISSION_DENIED)
    if (
      error?.status === 403 ||
      error?.message?.includes('403') ||
      error?.message?.includes('PERMISSION_DENIED') ||
      error?.message?.includes('API_KEY_INVALID')
    ) {
      throw new Error(
        'Gemini API Authorization Error (HTTP 403): The provided API key is invalid or restricted. Please check your VITE_GEMINI_API_KEY setup.'
      );
    }

    // Model not found (HTTP 404 / NOT_FOUND) -> Try fallback
    if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('NOT_FOUND')) {
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: options.systemInstruction ? {
            systemInstruction: options.systemInstruction
          } : undefined
        });
        if (fallbackResponse?.text && fallbackResponse.text.trim()) {
          return fallbackResponse.text;
        }
      } catch (fallbackErr) {
        console.error('Fallback model attempt also failed:', fallbackErr?.message || fallbackErr);
      }
    }

    // Network / connectivity issues
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      throw new Error('Network connection error. Please check your internet connection and try again.');
    }

    throw new Error(error?.message || 'An unexpected error occurred while communicating with Gemini API.');
  }
};
