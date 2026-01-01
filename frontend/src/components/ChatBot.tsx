import React, { useState, FormEvent, ChangeEvent, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations, ProductRecommendationDisplay, AIRecommendation, AIQueryParams } from './ProductRecommendation';
import { chatWithAI, resetConversation, isAIConfigured } from '../services/aiService';

interface Message {
  type: 'user' | 'bot';
  text: string;
  recommendation?: AIRecommendation;
}

// Quick suggestion chips for common queries
const QUICK_SUGGESTIONS = [
  { emoji: '🌿', text: 'Find bio beauty products' },
  { emoji: '💰', text: 'Compare prices on electronics' },
  { emoji: '👕', text: 'Best deals on clothing' },
  { emoji: '📊', text: 'eBay vs our store prices' },
  { emoji: '⭐', text: 'Premium quality items' },
  { emoji: '🏷️', text: 'Cheapest options available' },
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
      text: `👋 Hey there! I'm your AI shopping assistant${isAIConfigured() ? ' powered by AI' : ''}!\n\nI can help you:\n• 🔍 Find products across our store & eBay\n• 📊 Compare prices between sources\n• 💰 Discover the best deals\n• 🌿 Find bio & organic options\n\nJust tell me what you're looking for!`
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const toggleChat = (): void => {
    setIsOpen(!isOpen);
  };

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
      text: `👋 Chat cleared! I'm ready to help you find products again. What are you looking for?`
    }]);
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userQuery = inputMessage.trim();

    // Add user message
    const userMessage: Message = { type: 'user', text: userQuery };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await chatWithAI(userQuery);

      let recommendation: AIRecommendation | undefined;

      // If AI detected a product query, fetch recommendations with AI params
      if (aiResponse.productQuery) {
        const aiParams: AIQueryParams = {
          category: aiResponse.productQuery.category,
          searchTerms: aiResponse.productQuery.searchTerms,
          keywords: aiResponse.productQuery.keywords,
          pricePreference: aiResponse.productQuery.pricePreference,
          maxPrice: aiResponse.productQuery.maxPrice,
          wantsComparison: aiResponse.productQuery.wantsComparison,
        };

        recommendation = await getRecommendations(userQuery, aiParams);
      }

      const botMessage: Message = {
        type: 'bot',
        text: aiResponse.message,
        recommendation,
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        type: 'bot',
        text: '😅 Oops! Something went wrong. Could you try asking again?',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className={`fixed bottom-5 right-5 w-16 h-16 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] border-none cursor-pointer shadow-[0_4px_20px_rgba(102,126,234,0.4)] z-[1000] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] hover:scale-110 hover:shadow-[0_6px_30px_rgba(102,126,234,0.6)] active:scale-95 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={toggleChat}
        aria-label="Open AI Assistant"
      >
        <svg
          className="w-8 h-8 stroke-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="9" cy="10" r="1" fill="currentColor"/>
          <circle cx="15" cy="10" r="1" fill="currentColor"/>
          <path d="M9 14c0 1.5 1.5 2 3 2s3-.5 3-2"/>
        </svg>
        {/* Notification dot */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      {/* Chatbot Window - EXTRA LARGE */}
      <div className={`fixed bottom-5 right-5 w-[600px] h-[85vh] max-w-[calc(100vw-40px)] max-h-[900px] min-h-[500px] bg-white rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.3)] z-[999] flex flex-col transition-all duration-400 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] overflow-hidden ${isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'}`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f64f59] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8 stroke-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a10 10 0 0 1-10-10c0-5.523 4.477-10 10-10z"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h3 className="m-0 text-xl font-bold">AI Shopping Assistant</h3>
              <div className="text-sm opacity-90 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {isAIConfigured() ? 'AI Powered • Online' : 'Smart Assistant • Online'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="bg-white/10 hover:bg-white/20 border-none cursor-pointer p-2.5 rounded-xl transition-all duration-200 text-white text-xs"
              onClick={handleClearChat}
              title="Clear chat"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
            <button
              className="bg-white/10 hover:bg-white/20 border-none cursor-pointer p-2.5 rounded-xl transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-6 h-6 stroke-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white flex flex-col gap-5">
          {messages.map((message, index) => (
            <div key={index} className={`flex flex-col animate-slideInUp ${message.type === 'bot' ? 'items-start' : 'items-end'}`}>
              {message.type === 'bot' && (
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="9" cy="10" r="1" fill="currentColor"/>
                      <circle cx="15" cy="10" r="1" fill="currentColor"/>
                      <path d="M9 14c0 1 1 2 3 2s3-1 3-2"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">AI Assistant</span>
                </div>
              )}
              <div className={`p-4 rounded-2xl max-w-[92%] break-words leading-relaxed text-[15px] ${
                message.type === 'bot' 
                  ? 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-md' 
                  : 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-tr-md shadow-lg'
              }`}>
                <div className="whitespace-pre-line">{message.text}</div>
                {message.recommendation && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <ProductRecommendationDisplay
                      recommendation={message.recommendation}
                      onProductClick={handleProductClick}
                    />
                  </div>
                )}
              </div>
              <div className="text-[11px] text-gray-400 mt-2 px-2">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 stroke-white animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div className="bg-white text-gray-800 border border-gray-100 shadow-sm rounded-2xl rounded-tl-md p-4">
                <div className="flex gap-2 items-center">
                  <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  <span className="ml-3 text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length <= 2 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3 font-medium">✨ Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickSuggestion(suggestion.text)}
                  className="text-sm px-4 py-2.5 bg-white hover:bg-purple-50 hover:border-purple-300 text-gray-700 rounded-xl transition-all border border-gray-200 shadow-sm hover:shadow-md"
                >
                  {suggestion.emoji} {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form className="flex gap-3 p-5 bg-white border-t border-gray-100" onSubmit={handleSendMessage}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask me anything about products..."
            value={inputMessage}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 p-4 px-6 border border-gray-200 rounded-2xl text-base outline-none transition-all duration-200 focus:border-purple-400 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.15)] disabled:bg-gray-50 placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-14 h-14 rounded-2xl border-none bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-[0_8px_25px_rgba(102,126,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            🤖 {isAIConfigured() ? 'Powered by AI' : 'Smart Shopping Assistant'} • Comparing <span className="font-semibold text-green-600">Our Store</span> & <span className="font-semibold text-blue-600">eBay</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatBot;

