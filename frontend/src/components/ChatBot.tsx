import React, { useState, FormEvent, ChangeEvent, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatWithAI, resetConversation, isAIConfigured, AIResponse, ProductAnalysis } from '../services/aiService';
import { Product } from '../types';

interface Message {
  type: 'user' | 'bot';
  text: string;
  products?: Product[];
  analysis?: ProductAnalysis;
}

// Quick suggestion chips
const QUICK_SUGGESTIONS = [
  'Find me a laptop under $500',
  'Best wireless headphones',
  'Compare phone prices',
  'Organic skincare products',
];

const ChatBot: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      text: `👋 Hi! I'm your AI shopping assistant.\n\n${isAIConfigured() 
        ? "I can search products, compare prices, and give you personalized recommendations. Just ask me anything!" 
        : "⚠️ AI is not configured. Add REACT_APP_AI_API_KEY to your .env file for intelligent recommendations.\n\nI can still search products for you!"}`
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleProductClick = (productId: string): void => {
    navigate(`/product/${productId}`);
    setIsOpen(false);
  };

  const handleQuickSuggestion = (text: string): void => {
    setInputMessage(text);
    inputRef.current?.focus();
  };

  const handleClearChat = (): void => {
    resetConversation();
    setMessages([{
      type: 'bot',
      text: `👋 Chat cleared! What can I help you find?`
    }]);
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userQuery = inputMessage.trim();
    setMessages(prev => [...prev, { type: 'user', text: userQuery }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response: AIResponse = await chatWithAI(userQuery);

      setMessages(prev => [...prev, {
        type: 'bot',
        text: response.message,
        products: response.products,
        analysis: response.analysis
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: '😅 Something went wrong. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gray-900 text-white shadow-lg z-[1000] flex items-center justify-center transition-all duration-300 hover:scale-105 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[900px] h-[850px] max-w-[calc(100vw-48px)] max-h-[90vh] bg-white rounded-2xl shadow-2xl z-[999] flex flex-col transition-all duration-300 overflow-hidden border border-gray-200 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>

        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <circle cx="9" cy="10" r="1" fill="currentColor"/>
                <circle cx="15" cy="10" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">AI Shopping Assistant</h3>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isAIConfigured() ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                {isAIConfigured() ? 'AI Powered' : 'Basic Mode'}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={handleClearChat} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Clear chat">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              message={msg}
              onProductClick={handleProductClick}
            />
          ))}

          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length <= 2 && (
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickSuggestion(text)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form className="p-3 bg-white/80 backdrop-blur-sm border-t border-white/20 flex gap-2" onSubmit={handleSendMessage}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask anything about products..."
            value={inputMessage}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 p-3 bg-gray-100/80 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-black disabled:opacity-50 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>
    </>
  );
};

// Message Bubble Component
interface MessageBubbleProps {
  message: Message;
  onProductClick: (id: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onProductClick }) => {
  const [showAll, setShowAll] = useState(false);
  const isBot = message.type === 'bot';
  const INITIAL_PRODUCTS = 4;

  const displayProducts = message.products
    ? (showAll ? message.products : message.products.slice(0, INITIAL_PRODUCTS))
    : [];

  return (
    <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
      {isBot && <span className="text-[10px] text-gray-400 mb-1 ml-1">AI Assistant</span>}

      <div className={`max-w-[90%] ${isBot ? '' : ''}`}>
        {/* Text Message */}
        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
          isBot 
            ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none' 
            : 'bg-gray-900 text-white rounded-tr-none'
        }`}>
          <div className="whitespace-pre-line">{message.text}</div>
        </div>

        {/* Analysis Section */}
        {message.analysis && (
          <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            {/* Price Comparison */}
            {message.analysis.comparison && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">📊 Price Comparison</h4>
                <div className="flex justify-between text-center">
                  <div>
                    <p className="text-xs text-gray-500">Our Store</p>
                    <p className="font-bold text-green-600">${message.analysis.comparison.internalAvg.toFixed(2)}</p>
                  </div>
                  <div className="text-gray-300">vs</div>
                  <div>
                    <p className="text-xs text-gray-500">eBay</p>
                    <p className="font-bold text-blue-600">${message.analysis.comparison.ebayAvg.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-xs text-center text-purple-700 mt-2 font-medium">{message.analysis.comparison.verdict}</p>
              </div>
            )}

            {/* Best Value Highlight */}
            {message.analysis.bestValue && (
              <div className="bg-green-50/50 backdrop-blur-sm border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-600">🏆</span>
                  <span className="text-xs font-semibold text-green-800">Best Value</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{message.analysis.bestValue.product.nom}</p>
                <p className="text-xs text-gray-600">{message.analysis.bestValue.reason}</p>
                <p className="text-sm font-bold text-green-600 mt-1">${message.analysis.bestValue.product.prix?.toFixed(2)}</p>
              </div>
            )}

            {/* Price Range */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Range: ${message.analysis.priceRange.min.toFixed(2)} - ${message.analysis.priceRange.max.toFixed(2)}</span>
              <span>Avg: ${message.analysis.priceRange.avg.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {message.products && message.products.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-gray-500 font-medium">{message.products.length} products found</p>

            <div className="grid grid-cols-2 gap-2">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product.id)}
                  isBestValue={message.analysis?.bestValue?.product.id === product.id}
                />
              ))}
            </div>

            {message.products.length > INITIAL_PRODUCTS && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {showAll ? 'Show Less' : `View All ${message.products.length} Products`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isBestValue?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isBestValue }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`relative bg-white/80 backdrop-blur-sm border rounded-xl p-2 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
        isBestValue ? 'border-green-300 ring-1 ring-green-200' : 'border-white/20 hover:border-white/40'
      }`}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-2 relative">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.nom}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}
        {isBestValue && (
          <span className="absolute top-1 left-1 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
            Best Value
          </span>
        )}
        <span className={`absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
          product.source === 'EBAY' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        }`}>
          {product.source === 'EBAY' ? 'eBay' : 'Ours'}
        </span>
      </div>

      {/* Info */}
      <h4 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1" title={product.nom}>
        {product.nom}
      </h4>
      <p className="text-sm font-bold text-gray-900">${product.prix?.toFixed(2)}</p>

      {/* Link for eBay */}
      {product.source === 'EBAY' && product.itemWebUrl && (
        <a
          href={product.itemWebUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-blue-600 hover:underline mt-1 block"
        >
          View on eBay →
        </a>
      )}
    </div>
  );
};

export default ChatBot;

