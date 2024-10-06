import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessages = [...messages, { sender: 'user', text: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
      });
      const data = await response.json();
      setMessages([...newMessages, { sender: 'Ai chef', text: data.reply }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { sender: 'Ai chef', text: 'Sorry, I encountered an error. Please try again.' }]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-90 h-[500px] md:w-96 md:h-[500px] flex flex-col">
          <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <Bot size={24} className="mr-2" />
              <h3 className="text-xl font-semibold">AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-green-100 text-green-900'
                    : 'bg-white text-gray-800 shadow-md'
                }`}>
                  {message.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-4 bg-white rounded-b-lg">
            <div className="flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Type your message..."
              />
              <button
                onClick={handleSendMessage}
                className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out shadow-lg"
      >
        <Bot size={28} />
      </button>
    </div>
  );
};

export default ChatBot;