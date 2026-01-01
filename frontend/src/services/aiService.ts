import { Product } from '../types';

// AI Service Configuration
// You can use OpenAI, or free alternatives like:
// - Groq (free tier): https://groq.com
// - Together AI: https://together.ai
// - Local LLM via Ollama: http://localhost:11434

interface AIConfig {
  provider: 'openai' | 'groq' | 'ollama' | 'mock';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

// Default configuration - change this based on your preference
const AI_CONFIG: AIConfig = {
  provider: 'groq', // Using Groq as it has a generous free tier
  apiKey: process.env.REACT_APP_AI_API_KEY || '', // Set in .env file
  baseUrl: 'https://api.groq.com/openai/v1',
  model: 'llama-3.1-8b-instant', // Fast and free on Groq
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  message: string;
  productQuery?: {
    category?: string;
    searchTerms?: string;
    keywords?: string[];
    pricePreference?: 'cheap' | 'expensive' | 'any';
    maxPrice?: number;
    wantsComparison?: boolean;
  };
}

// System prompt for the shopping assistant
const SYSTEM_PROMPT = `You are a friendly AI shopping assistant for a marketplace that sells products from an internal catalog and eBay. 

Your capabilities:
- Help users find products by category (beauty, electronics, clothing, sports, home)
- Compare prices between internal store and eBay
- Recommend bio/organic/natural products
- Find budget-friendly or premium options

When users ask about products, respond naturally and extract their intent. Always be helpful, concise, and friendly.

IMPORTANT: When the user asks about products, you MUST include a JSON block at the end of your response in this format:
\`\`\`json
{"category": "electronics", "searchTerms": "laptop notebook computer", "keywords": ["gaming", "portable"], "pricePreference": "cheap", "maxPrice": 1500, "wantsComparison": true}
\`\`\`

Fields explanation:
- category: One of: beauty, electronics, clothing, sports, home
- searchTerms: SPECIFIC product type the user wants (e.g., "laptop", "phone", "headphones", "skincare cream"). This is crucial for filtering!
- keywords: Additional attributes (bio, organic, gaming, portable, premium, etc.)
- pricePreference: cheap, expensive, or any
- maxPrice: Maximum budget if mentioned (number or null)
- wantsComparison: true if user wants to compare prices

Examples:
- "I want a laptop under $1000" → searchTerms: "laptop notebook", maxPrice: 1000
- "Show me organic face cream" → searchTerms: "face cream skincare", keywords: ["organic", "bio"]
- "Best gaming headphones" → searchTerms: "headphones gaming headset", keywords: ["gaming"]

If the user is just chatting (greeting, thanks, general questions), respond naturally without the JSON block.`;


// Parse AI response to extract product query
const parseAIResponse = (response: string): AIResponse => {
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  let productQuery;
  let cleanMessage = response;

  if (jsonMatch) {
    try {
      productQuery = JSON.parse(jsonMatch[1]);
      cleanMessage = response.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
    } catch (e) {
      console.warn('Failed to parse AI product query:', e);
    }
  }

  return {
    message: cleanMessage,
    productQuery,
  };
};

// Call AI API
const callAI = async (messages: ChatMessage[]): Promise<string> => {
  if (AI_CONFIG.provider === 'mock' || !AI_CONFIG.apiKey) {
    // Return mock response if no API key
    return getMockResponse(messages[messages.length - 1].content);
  }

  try {
    const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, I had trouble processing that.';
  } catch (error) {
    console.error('AI API error:', error);
    // Fallback to mock response
    return getMockResponse(messages[messages.length - 1].content);
  }
};

// Smart mock responses when no API key is configured
const getMockResponse = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();

  // Greetings
  if (/^(hi|hello|hey|bonjour|salut)/i.test(lower)) {
    return "👋 Hey there! I'm your AI shopping assistant. I can help you find amazing products, compare prices between our store and eBay, and discover the best deals. What are you looking for today?";
  }

  // Help
  if (lower.includes('help') || lower.includes('what can you do')) {
    return "🤖 I'm here to help you shop smarter! Here's what I can do:\n\n• 🔍 Find products by category or keywords\n• 📊 Compare prices (Our Store vs eBay)\n• 💰 Find budget-friendly options\n• 🌿 Discover bio & organic products\n• ⭐ Recommend premium items\n\nJust tell me what you're looking for!";
  }

  // Thanks
  if (lower.includes('thank')) {
    return "😊 You're welcome! Happy to help. Let me know if you need anything else!";
  }

  // Goodbye
  if (lower.includes('bye') || lower.includes('goodbye')) {
    return "👋 See you later! Come back anytime you need help finding great deals!";
  }

  // Beauty products
  if (lower.includes('beauty') || lower.includes('skincare') || lower.includes('makeup') || lower.includes('cosmetic')) {
    const response = "💄 Great choice! I'll search for beauty products for you. I'll compare prices between our store and eBay to find you the best deals!";
    if (lower.includes('bio') || lower.includes('organic') || lower.includes('natural')) {
      return response + "\n\n🌿 I noticed you're interested in natural/organic options - I'll prioritize those!\n\n```json\n{\"category\": \"beauty\", \"keywords\": [\"bio\", \"organic\", \"natural\"], \"pricePreference\": \"any\", \"wantsComparison\": true}\n```";
    }
    if (lower.includes('cheap') || lower.includes('affordable') || lower.includes('budget')) {
      return response + "\n\n💰 Looking for budget-friendly options - I'll sort by best prices!\n\n```json\n{\"category\": \"beauty\", \"keywords\": [], \"pricePreference\": \"cheap\", \"wantsComparison\": true}\n```";
    }
    return response + "\n\n```json\n{\"category\": \"beauty\", \"keywords\": [], \"pricePreference\": \"any\", \"wantsComparison\": true}\n```";
  }

  // Electronics
  if (lower.includes('electronic') || lower.includes('phone') || lower.includes('laptop') || lower.includes('computer') || lower.includes('tech') || lower.includes('gadget')) {
    const response = "📱 Electronics coming right up! Let me search our catalog and eBay for the best options.";
    if (lower.includes('cheap') || lower.includes('affordable') || lower.includes('budget')) {
      return response + "\n\n💰 I'll focus on budget-friendly tech!\n\n```json\n{\"category\": \"electronics\", \"keywords\": [], \"pricePreference\": \"cheap\", \"wantsComparison\": true}\n```";
    }
    if (lower.includes('premium') || lower.includes('best') || lower.includes('high-end')) {
      return response + "\n\n⭐ Looking for premium quality!\n\n```json\n{\"category\": \"electronics\", \"keywords\": [\"premium\"], \"pricePreference\": \"expensive\", \"wantsComparison\": true}\n```";
    }
    return response + "\n\n```json\n{\"category\": \"electronics\", \"keywords\": [], \"pricePreference\": \"any\", \"wantsComparison\": true}\n```";
  }

  // Clothing
  if (lower.includes('cloth') || lower.includes('fashion') || lower.includes('shirt') || lower.includes('dress') || lower.includes('wear') || lower.includes('outfit')) {
    return "👕 Fashion time! Let me find some great clothing options for you. I'll compare prices across sources!\n\n```json\n{\"category\": \"clothing\", \"keywords\": [], \"pricePreference\": \"any\", \"wantsComparison\": true}\n```";
  }

  // Sports
  if (lower.includes('sport') || lower.includes('fitness') || lower.includes('gym') || lower.includes('workout') || lower.includes('exercise')) {
    return "🏃 Let's get you geared up! I'll find sports and fitness products from our store and eBay.\n\n```json\n{\"category\": \"sports\", \"keywords\": [], \"pricePreference\": \"any\", \"wantsComparison\": true}\n```";
  }

  // Home
  if (lower.includes('home') || lower.includes('furniture') || lower.includes('decor') || lower.includes('kitchen')) {
    return "🏠 Home sweet home! Let me search for home products and compare the best deals.\n\n```json\n{\"category\": \"home\", \"keywords\": [], \"pricePreference\": \"any\", \"wantsComparison\": true}\n```";
  }

  // Compare / prices
  if (lower.includes('compare') || lower.includes('price') || lower.includes('deal') || lower.includes('vs')) {
    return "📊 I love finding deals! Tell me what category you're interested in (beauty, electronics, clothing, sports, or home) and I'll compare prices between our store and eBay!";
  }

  // Bio / Organic
  if (lower.includes('bio') || lower.includes('organic') || lower.includes('natural') || lower.includes('eco')) {
    return "🌿 Eco-friendly shopping! What category are you looking for? I can find bio and organic options in beauty, home, and more!";
  }

  // Cheap / Budget
  if (lower.includes('cheap') || lower.includes('budget') || lower.includes('affordable')) {
    return "💰 Budget-conscious shopping is smart! What type of product are you looking for? I'll find the best prices!";
  }

  // Generic product search
  if (lower.includes('find') || lower.includes('search') || lower.includes('show') || lower.includes('looking') || lower.includes('want') || lower.includes('need') || lower.includes('buy') || lower.includes('get')) {
    return "🔍 I'd love to help you find something! Could you tell me more about what you're looking for?\n\nYou can ask for:\n• Categories: beauty, electronics, clothing, sports, home\n• Preferences: cheap, premium, bio/organic\n• Comparisons: \"compare prices on electronics\"";
  }

  // Default response
  return "🤔 I'm your shopping assistant! I can help you:\n\n• 🔍 Find products (beauty, electronics, clothing, etc.)\n• 📊 Compare prices between our store and eBay\n• 💰 Find the best deals\n• 🌿 Discover organic/bio options\n\nTry asking: \"Find me affordable beauty products\" or \"Compare electronics prices\"";
};

// Conversation history for context
let conversationHistory: ChatMessage[] = [];

// Main AI chat function
export const chatWithAI = async (userMessage: string, products?: Product[]): Promise<AIResponse> => {
  // Add context about available products if provided
  let contextMessage = '';
  if (products && products.length > 0) {
    const productSummary = products.slice(0, 5).map(p =>
      `- ${p.nom}: $${p.prix} (${p.source})`
    ).join('\n');
    contextMessage = `\n\nRecent products found:\n${productSummary}`;
  }

  // Build messages array
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + contextMessage },
    ...conversationHistory.slice(-6), // Keep last 6 messages for context
    { role: 'user', content: userMessage },
  ];

  // Get AI response
  const response = await callAI(messages);

  // Update conversation history
  conversationHistory.push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: response }
  );

  // Keep history manageable
  if (conversationHistory.length > 12) {
    conversationHistory = conversationHistory.slice(-12);
  }

  return parseAIResponse(response);
};

// Reset conversation
export const resetConversation = (): void => {
  conversationHistory = [];
};

// Check if AI is configured
export const isAIConfigured = (): boolean => {
  return AI_CONFIG.provider !== 'mock' && !!AI_CONFIG.apiKey;
};

export default { chatWithAI, resetConversation, isAIConfigured };

