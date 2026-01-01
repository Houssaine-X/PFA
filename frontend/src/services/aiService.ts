import { Product, EbayItem } from '../types';
import { productService, ebayService, transformEbayItem } from './api';

// AI Service Configuration
interface AIConfig {
  provider: 'openai' | 'groq' | 'ollama';
  apiKey: string;
  baseUrl: string;
  model: string;
}

const AI_CONFIG: AIConfig = {
  provider: 'groq',
  apiKey: process.env.REACT_APP_AI_API_KEY || '',
  baseUrl: process.env.REACT_APP_AI_BASE_URL || 'https://api.groq.com/openai/v1',
  model: process.env.REACT_APP_AI_MODEL || 'llama-3.3-70b-versatile',
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  message: string;
  products: Product[];
  analysis?: ProductAnalysis;
}

export interface ProductAnalysis {
  bestValue?: ProductInsight;
  cheapest?: ProductInsight;
  premium?: ProductInsight;
  priceRange: { min: number; max: number; avg: number };
  recommendation: string;
  comparison?: {
    internalAvg: number;
    ebayAvg: number;
    verdict: string;
  };
}

export interface ProductInsight {
  product: Product;
  reason: string;
}

// Call AI API
const callAI = async (messages: ChatMessage[], jsonMode: boolean = true): Promise<string> => {
  if (!AI_CONFIG.apiKey) {
    throw new Error('AI API key not configured');
  }

  const body: Record<string, unknown> = {
    model: AI_CONFIG.model,
    messages,
    temperature: 0.3,
    max_tokens: 2000,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

// Fetch all products from internal and eBay
const fetchAllProducts = async (searchQuery: string, sourcePreference?: 'ebay' | 'internal' | 'all'): Promise<Product[]> => {
  const allProducts: Product[] = [];
  const source = sourcePreference || 'all';

  // Fetch internal products (unless user only wants eBay)
  if (source === 'all' || source === 'internal') {
    try {
      const internalResponse = await productService.getAllProducts();
      const internalProducts = internalResponse.data.map((p: Product) => ({
        ...p,
        source: p.source || 'INTERNAL'
      }));
      allProducts.push(...internalProducts);
    } catch (err) {
      console.warn('Could not fetch internal products:', err);
    }
  }

  // Fetch eBay products (unless user only wants internal)
  if (source === 'all' || source === 'ebay') {
    try {
      const ebayResponse = await ebayService.searchProducts(searchQuery, 50);
      const responseData = ebayResponse.data;

      if (Array.isArray(responseData)) {
        allProducts.push(...(responseData as EbayItem[]).map(transformEbayItem));
      } else if (responseData && typeof responseData === 'object' && 'itemSummaries' in responseData) {
        const items = (responseData as { itemSummaries: EbayItem[] }).itemSummaries;
        allProducts.push(...items.map(transformEbayItem));
      }
    } catch (err) {
      console.warn('Could not fetch eBay products:', err);
    }
  }

  return allProducts;
};

// ==================== CONVERSATION CONTEXT ====================
// Store conversation history AND the products that were shown
interface ConversationContext {
  messages: ChatMessage[];
  lastProducts: Product[];
  lastQuery: string;
}

let conversationContext: ConversationContext = {
  messages: [],
  lastProducts: [],
  lastQuery: ''
};

// Format products for AI context
const formatProductsForAI = (products: Product[]): string => {
  if (products.length === 0) return 'No products currently shown.';

  return products.map((p, i) =>
    `${i + 1}. "${p.nom}" - $${p.prix?.toFixed(2)} (${p.source || 'Internal'})`
  ).join('\n');
};

// ==================== MAIN CHAT FUNCTION ====================
export const chatWithAI = async (userMessage: string): Promise<AIResponse> => {
  try {
    if (!AI_CONFIG.apiKey) {
      throw new Error('AI API key not configured');
    }

    // Build context from previous conversation
    const previousProductsContext = conversationContext.lastProducts.length > 0
      ? `\n\nPREVIOUSLY SHOWN PRODUCTS (user may refer to these):\n${formatProductsForAI(conversationContext.lastProducts)}`
      : '';

    // STEP 1: Determine if this is a follow-up or new query
    const intentPrompt = `You are a shopping assistant. Analyze this user message in context of the conversation.

${previousProductsContext}

Previous conversation:
${conversationContext.messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}

Current user message: "${userMessage}"

Determine:
1. Is this a FOLLOW-UP question about previously shown products? (e.g., "which is the best value?", "what about the cheapest one?", "tell me more about option 2")
2. Or is this a NEW product search?
3. Does the user want products from a SPECIFIC SOURCE? (eBay, our store/internal)
4. Is the user asking to SEARCH for something on eBay or find similar products? (This is a NEW SEARCH, not a follow-up)

IMPORTANT: If user says things like "find these on eBay", "search eBay for...", "show me eBay options", "what's on eBay" - this is a NEW SEARCH with sourcePreference: "ebay", NOT a follow-up!

Respond with JSON:
{
  "isFollowUp": true/false,
  "isGeneralChat": true/false,
  "wantsNewSearch": true/false,
  "productType": "specific product type if new search",
  "searchTerms": "search terms for the search (use previous product type if searching on different source)",
  "maxPrice": null or number,
  "minPrice": null or number,
  "exclude": ["words", "to", "exclude"],
  "sourcePreference": "ebay" or "internal" or "all",
  "followUpIntent": "what the user wants to know about previous products (if follow-up)"
}`;

    const intentResponse = await callAI([
      { role: 'system', content: intentPrompt },
      { role: 'user', content: userMessage }
    ]);

    let intent: {
      isFollowUp?: boolean;
      isGeneralChat?: boolean;
      productType?: string;
      searchTerms?: string;
      maxPrice?: number | null;
      minPrice?: number | null;
      exclude?: string[];
      followUpIntent?: string;
      sourcePreference?: 'ebay' | 'internal' | 'all';
      wantsNewSearch?: boolean;
    };

    try {
      intent = JSON.parse(intentResponse);
    } catch {
      intent = { isFollowUp: false, isGeneralChat: false, searchTerms: userMessage };
    }

    // ==================== HANDLE GENERAL CHAT ====================
    if (intent.isGeneralChat) {
      const chatResponse = await callAI([
        { role: 'system', content: 'You are a friendly shopping assistant. Respond naturally. Respond with JSON: {"message": "your response"}' },
        ...conversationContext.messages.slice(-4),
        { role: 'user', content: userMessage }
      ]);

      try {
        const parsed = JSON.parse(chatResponse);
        conversationContext.messages.push(
          { role: 'user', content: userMessage },
          { role: 'assistant', content: parsed.message }
        );
        return { message: parsed.message, products: [] };
      } catch {
        return { message: "Hi! How can I help you find products today?", products: [] };
      }
    }

    // ==================== HANDLE FOLLOW-UP QUESTIONS ====================
    // Only handle as follow-up if it's truly a follow-up AND user doesn't want a new search
    if (intent.isFollowUp && !intent.wantsNewSearch && conversationContext.lastProducts.length > 0) {
      const followUpPrompt = `You are a shopping assistant. The user is asking a follow-up question about these products:

PRODUCTS BEING DISCUSSED:
${formatProductsForAI(conversationContext.lastProducts)}

User's follow-up question: "${userMessage}"
Intent: ${intent.followUpIntent || 'analyze these products'}

Provide a helpful response analyzing the products. If they ask about "best value", "cheapest", "which one", etc., refer to the specific products by name.

Respond with JSON:
{
  "message": "Your detailed, helpful response referring to specific products by name",
  "analysis": {
    "recommendation": "Your specific recommendation",
    "bestValueIndex": 0,
    "bestValueReason": "Why this is best value",
    "cheapestIndex": 0,
    "premiumIndex": 0,
    "premiumReason": "Why this is premium"
  }
}

IMPORTANT: Reference products by their actual names from the list above.`;

      const followUpResponse = await callAI([
        { role: 'system', content: followUpPrompt },
        ...conversationContext.messages.slice(-4),
        { role: 'user', content: userMessage }
      ]);

      let parsed;
      try {
        parsed = JSON.parse(followUpResponse);
      } catch {
        return { message: "I'm not sure what you're asking. Could you clarify?", products: conversationContext.lastProducts };
      }

      // Build analysis from AI response
      const products = conversationContext.lastProducts;
      let analysis: ProductAnalysis | undefined;

      if (products.length > 0 && parsed.analysis) {
        const prices = products.map(p => p.prix || 0).filter(p => p > 0);
        const internalProducts = products.filter(p => p.source === 'INTERNAL');
        const ebayProducts = products.filter(p => p.source === 'EBAY');

        const internalAvg = internalProducts.length > 0
          ? internalProducts.reduce((sum, p) => sum + (p.prix || 0), 0) / internalProducts.length : 0;
        const ebayAvg = ebayProducts.length > 0
          ? ebayProducts.reduce((sum, p) => sum + (p.prix || 0), 0) / ebayProducts.length : 0;

        let verdict = '';
        if (internalAvg > 0 && ebayAvg > 0) {
          const diff = Math.abs(((internalAvg - ebayAvg) / ebayAvg) * 100).toFixed(0);
          verdict = internalAvg < ebayAvg ? `Our store is ${diff}% cheaper!` : `eBay is ${diff}% cheaper`;
        }

        analysis = {
          priceRange: {
            min: prices.length > 0 ? Math.min(...prices) : 0,
            max: prices.length > 0 ? Math.max(...prices) : 0,
            avg: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
          },
          recommendation: parsed.analysis.recommendation || '',
          comparison: internalAvg > 0 && ebayAvg > 0 ? { internalAvg, ebayAvg, verdict } : undefined
        };

        if (typeof parsed.analysis.bestValueIndex === 'number' && products[parsed.analysis.bestValueIndex]) {
          analysis.bestValue = {
            product: products[parsed.analysis.bestValueIndex],
            reason: parsed.analysis.bestValueReason || 'Best value for money'
          };
        }

        if (products.length > 0) {
          const sorted = [...products].sort((a, b) => (a.prix || 0) - (b.prix || 0));
          analysis.cheapest = { product: sorted[0], reason: 'Lowest price' };
        }

        if (typeof parsed.analysis.premiumIndex === 'number' && products[parsed.analysis.premiumIndex]) {
          analysis.premium = {
            product: products[parsed.analysis.premiumIndex],
            reason: parsed.analysis.premiumReason || 'Premium option'
          };
        }
      }

      // Update conversation
      conversationContext.messages.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: parsed.message }
      );

      return {
        message: parsed.message,
        products: products,
        analysis
      };
    }

    // ==================== HANDLE NEW PRODUCT SEARCH ====================
    // Use previous product type if user is searching on a different source
    const searchQuery = intent.searchTerms || intent.productType || conversationContext.lastQuery || userMessage;
    let products = await fetchAllProducts(searchQuery, intent.sourcePreference);

    // Apply price filters
    if (intent.maxPrice) {
      const maxPrice = intent.maxPrice;
      products = products.filter(p => (p.prix || 0) <= maxPrice);
    }
    if (intent.minPrice) {
      const minPrice = intent.minPrice;
      products = products.filter(p => (p.prix || 0) >= minPrice);
    }

    // If user wants specific source, filter again to be sure
    if (intent.sourcePreference === 'ebay') {
      products = products.filter(p => p.source === 'EBAY');
    } else if (intent.sourcePreference === 'internal') {
      products = products.filter(p => p.source === 'INTERNAL' || !p.source);
    }

    // Ask AI to filter and analyze
    const productListForAI = products.slice(0, 40).map((p, i) => ({
      index: i,
      name: p.nom,
      price: p.prix,
      source: p.source,
      description: p.description?.substring(0, 100) || ''
    }));

    const sourceInfo = intent.sourcePreference === 'ebay' ? 'ONLY eBay products' :
                       intent.sourcePreference === 'internal' ? 'ONLY our store products' : 'all sources';

    const filterPrompt = `You are a shopping assistant. User wants: "${userMessage}"
Specific product type: ${intent.productType || 'unknown'}
Source: ${sourceInfo}
${intent.exclude?.length ? `EXCLUDE these: ${intent.exclude.join(', ')}` : ''}

PRODUCTS FOUND (${productListForAI.length}):
${JSON.stringify(productListForAI, null, 2)}

YOUR TASK:
1. STRICTLY filter - only include products that ARE ${intent.productType || 'what the user asked for'}
2. EXCLUDE accessories, cases, covers, chargers, cables unless that's what user wants
3. Analyze the relevant products

Respond with JSON:
{
  "message": "Your helpful response about what you found",
  "relevantProductIndices": [0, 1, 2],
  "hasRelevantProducts": true/false,
  "analysis": {
    "recommendation": "Your recommendation",
    "bestValueIndex": 0,
    "bestValueReason": "Why",
    "cheapestIndex": 0,
    "premiumIndex": 0,
    "premiumReason": "Why"
  }
}

If NO relevant products found, set hasRelevantProducts: false and relevantProductIndices: []`;

    const filterResponse = await callAI([
      { role: 'system', content: filterPrompt },
      { role: 'user', content: userMessage }
    ]);

    let parsed;
    try {
      parsed = JSON.parse(filterResponse);
    } catch {
      return { message: "I had trouble analyzing the products. Please try again.", products: [] };
    }

    // Get relevant products
    let relevantProducts: Product[] = [];
    if (parsed.hasRelevantProducts && parsed.relevantProductIndices?.length > 0) {
      relevantProducts = parsed.relevantProductIndices
        .filter((idx: number) => idx >= 0 && idx < products.length)
        .map((idx: number) => products[idx]);
    }

    // Sort by price
    relevantProducts.sort((a, b) => (a.prix || 0) - (b.prix || 0));

    // Build analysis
    let analysis: ProductAnalysis | undefined;
    if (relevantProducts.length > 0 && parsed.analysis) {
      const prices = relevantProducts.map(p => p.prix || 0).filter(p => p > 0);
      const internalProducts = relevantProducts.filter(p => p.source === 'INTERNAL');
      const ebayProducts = relevantProducts.filter(p => p.source === 'EBAY');

      const internalAvg = internalProducts.length > 0
        ? internalProducts.reduce((sum, p) => sum + (p.prix || 0), 0) / internalProducts.length : 0;
      const ebayAvg = ebayProducts.length > 0
        ? ebayProducts.reduce((sum, p) => sum + (p.prix || 0), 0) / ebayProducts.length : 0;

      let verdict = '';
      if (internalAvg > 0 && ebayAvg > 0) {
        const diff = Math.abs(((internalAvg - ebayAvg) / ebayAvg) * 100).toFixed(0);
        verdict = internalAvg < ebayAvg ? `Our store is ${diff}% cheaper!` : `eBay is ${diff}% cheaper`;
      }

      analysis = {
        priceRange: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0,
          avg: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
        },
        recommendation: parsed.analysis.recommendation || '',
        comparison: internalAvg > 0 && ebayAvg > 0 ? { internalAvg, ebayAvg, verdict } : undefined
      };

      if (typeof parsed.analysis.bestValueIndex === 'number' && relevantProducts[parsed.analysis.bestValueIndex]) {
        analysis.bestValue = {
          product: relevantProducts[parsed.analysis.bestValueIndex],
          reason: parsed.analysis.bestValueReason || 'Best value'
        };
      }

      if (relevantProducts.length > 0) {
        analysis.cheapest = { product: relevantProducts[0], reason: 'Lowest price' };
      }

      if (typeof parsed.analysis.premiumIndex === 'number' && relevantProducts[parsed.analysis.premiumIndex]) {
        analysis.premium = {
          product: relevantProducts[parsed.analysis.premiumIndex],
          reason: parsed.analysis.premiumReason || 'Premium option'
        };
      }
    }

    // ==================== SAVE CONTEXT ====================
    conversationContext.messages.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: parsed.message }
    );

    // Keep history manageable
    if (conversationContext.messages.length > 12) {
      conversationContext.messages = conversationContext.messages.slice(-12);
    }

    // IMPORTANT: Save the products for follow-up questions
    conversationContext.lastProducts = relevantProducts;
    conversationContext.lastQuery = userMessage;

    return {
      message: parsed.message,
      products: relevantProducts,
      analysis
    };

  } catch (error) {
    console.error('AI chat error:', error);
    return {
      message: error instanceof Error ? `Sorry: ${error.message}` : 'Something went wrong.',
      products: [],
    };
  }
};

// Reset conversation
export const resetConversation = (): void => {
  conversationContext = {
    messages: [],
    lastProducts: [],
    lastQuery: ''
  };
};

// Check if AI is configured
export const isAIConfigured = (): boolean => {
  return !!AI_CONFIG.apiKey;
};

export default { chatWithAI, resetConversation, isAIConfigured };

