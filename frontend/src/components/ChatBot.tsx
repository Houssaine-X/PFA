import React, { useState, FormEvent, ChangeEvent } from 'react';

interface Message {
  type: 'user' | 'bot';
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      text: 'Welcome to Marketplace Hub Assistant! I\'m an AI assistant here to help you find products, compare prices, and answer your questions. How can I assist you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');

  const toggleChat = (): void => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = { type: 'user', text: inputMessage };
    setMessages([...messages, userMessage]);

    // Clear input
    setInputMessage('');

    // Simulate bot response (placeholder for future RAG implementation)
    setTimeout(() => {
      const botMessage: Message = {
        type: 'bot',
        text: 'Thank you for your message. The AI assistant functionality will be implemented soon with advanced product search and recommendations.'
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className={`fixed bottom-5 right-5 w-14 h-14 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] border-none cursor-pointer shadow-[0_4px_20px_rgba(102,126,234,0.4)] z-[1000] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] hover:scale-110 hover:shadow-[0_6px_30px_rgba(102,126,234,0.6)] active:scale-95 ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle chatbot"
      >
        <svg
          className={`w-[30px] h-[30px] stroke-white transition-all duration-300 ease-out absolute ${isOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="9" cy="10" r="1"/>
          <circle cx="15" cy="10" r="1"/>
          <path d="M9 14c0 1.5 1.5 2 3 2s3-.5 3-2"/>
        </svg>
        <svg
          className={`w-[30px] h-[30px] stroke-white transition-all duration-300 ease-out absolute ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Chatbot Window */}
      <div className={`fixed bottom-[90px] right-5 w-[350px] h-[420px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-[999] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] overflow-hidden ${isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-5 scale-95 pointer-events-none'}`}>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulseShadow">
              <svg className="w-[22px] h-[22px] stroke-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <circle cx="9" cy="10" r="1"/>
                <circle cx="15" cy="10" r="1"/>
                <path d="M9 14c0 1.5 1.5 2 3 2s3-.5 3-2"/>
              </svg>
            </div>
            <div className="chatbot-info">
              <h3 className="m-0 text-[15px] font-semibold">Marketplace Assistant</h3>
              <div className="text-[11px] opacity-90 flex items-center gap-1.5 before:content-[''] before:w-2 before:h-2 before:bg-[#4ade80] before:rounded-full before:inline-block before:animate-pulse">
                Online
              </div>
            </div>
          </div>
          <button
            className="bg-transparent border-none cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-5 h-5 stroke-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#f9fafb] flex flex-col gap-2.5 rounded-t-2xl scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400">
          {messages.map((message, index) => (
            <div key={index} className={`flex flex-col animate-slideInUp ${message.type === 'bot' ? 'items-start' : 'items-end'}`}>
              <div className={`p-2.5 px-3.5 rounded-xl max-w-[78%] break-words leading-relaxed text-[13px] ${
                message.type === 'bot' 
                  ? 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm' 
                  : 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-br-sm'
              }`}>
                {message.text}
              </div>
              <div className="text-[11px] text-gray-400 mt-1 px-2">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form className="flex gap-2 p-4 bg-white border-t border-gray-200" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
            className="flex-1 p-3 px-4 border border-gray-200 rounded-3xl text-sm outline-none transition-all duration-200 focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="w-11 h-11 rounded-full border-none bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>

        {/* Footer Note */}
        <div className="p-2.5 px-4 bg-[#f9fafb] border-t border-gray-200 text-center">
          <small className="text-gray-400 text-[11px]">AI Assistant - Beta Version</small>
        </div>
      </div>
    </>
  );
};

export default ChatBot;

