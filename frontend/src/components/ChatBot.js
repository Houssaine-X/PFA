import React, { useState } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Welcome to Marketplace Hub Assistant! I\'m an AI assistant here to help you find products, compare prices, and answer your questions. How can I assist you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = { type: 'user', text: inputMessage };
    setMessages([...messages, userMessage]);

    // Clear input
    setInputMessage('');

    // Simulate bot response (placeholder for future RAG implementation)
    setTimeout(() => {
      const botMessage = {
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
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle chatbot"
      >
        <svg
          className="chatbot-icon"
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
          className="close-icon"
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
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-content">
                {message.text}
              </div>
              <div className="message-time">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form className="chatbot-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button type="submit" disabled={!inputMessage.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>

        {/* Footer Note */}
        <div className="chatbot-footer">
          <small>AI Assistant - Beta Version</small>
        </div>
      </div>
    </>
  );
};

export default ChatBot;

