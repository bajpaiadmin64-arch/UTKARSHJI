import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquare, X, Send, Loader2, Minimize2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  onSelectService: (serviceName: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function AIAssistant({ onSelectService, isOpen, onToggle }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi, I'm the U B Web Developer Smart Consultant, powered by Gemini. I can assist you in selecting the right website package, calculating Excel formulas budgets, explaining our services, or getting you started with an order! What kind of project are you working on today?",
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark unread messages if drawer is closed
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setUnread(true);
    }
  }, [messages.length, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnread(false);
    }
    scrollToBottom();
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: historyPayload })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: data.text,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If the model suggests a service or package, we can highlight the Order form or Payment
      if (textToSend.toLowerCase().includes('order') || textToSend.toLowerCase().includes('buy')) {
        // subtle helper
      }

    } catch (err) {
      console.error('Chat Assistant Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'assistant',
          text: "I apologize, I'm currently experiencing a connection hiccup with my core processor. Feel free to fill in our custom Order Form or contact Utkarsh directly at utkarshbajpai025@gmail.com!",
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage(input);
    }
  };

  const suggestionChips = [
    { label: 'Web Pricing?', text: 'What is the pricing for website development services?' },
    { label: 'Automate Excel?', text: 'How can you automate Excel files and build dashboards?' },
    { label: 'How to Pay?', text: 'What is the payment process and UPI ID?' },
    { label: 'Contact Info?', text: 'How do I contact Utkarsh Bajpai directly?' }
  ];

  return (
    <>
      {/* Floating Trigger Bubble */}
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-label="Toggle Smart AI Assistant"
        id="ai-floating-bubble"
      >
        <div className="relative">
          <Sparkles className="w-6 h-6 animate-pulse" />
          {unread && (
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-slate-950 animate-bounce"></span>
          )}
          {/* Tooltip on Hover */}
          <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden sm:block">
            AI Assistant Chat
          </span>
        </div>
      </button>

      {/* Floating Chat Drawer */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
          isOpen ? 'scale-100 translate-y-0 opacity-100 max-h-[600px] h-[550px]' : 'scale-90 translate-y-10 opacity-0 pointer-events-none h-0 max-h-0'
        }`}
        id="ai-chat-drawer"
      >
        {/* Header bar */}
        <div className="bg-slate-950/80 border-b border-slate-850 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">UB Consultant Bot</span>
              <span className="text-[9px] font-mono text-cyan-400 block tracking-widest uppercase animate-pulse">
                Active Gemini Node
              </span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white"
            title="Minimize Chat"
            id="chat-close-btn"
          >
            <Minimize2 className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Message logs */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 pr-3 scrollbar-thin scrollbar-thumb-slate-850 bg-slate-900/20">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender !== 'user' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-xs leading-relaxed font-light ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-medium rounded-tr-sm shadow-md'
                    : 'bg-slate-950/80 border border-slate-850 text-slate-300 rounded-tl-sm'
                }`}
              >
                {/* Parse newline characters into simple breaks */}
                {m.text.split('\n').map((line, key) => (
                  <span key={key}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center shrink-0">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              </div>
              <div className="bg-slate-950/40 border border-slate-850/60 px-4 py-3 rounded-2xl text-xs font-mono text-slate-500 rounded-tl-sm uppercase tracking-wider animate-pulse">
                Formulating recommendation...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Suggestions Row */}
        {messages.length === 1 && (
          <div className="px-5 py-2.5 border-t border-slate-850 bg-slate-950/20 flex flex-wrap gap-1.5" id="chat-suggestion-chips">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(chip.text)}
                className="text-[9px] font-mono tracking-wide text-slate-400 bg-slate-950 border border-slate-850 px-2.5 py-1.5 rounded-full hover:text-white hover:border-cyan-500/40 active:scale-95 transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="bg-slate-950/80 border-t border-slate-850 px-5 py-4 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask anything about web packages or Excel dashboards..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3 text-xs font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500"
            id="chat-input"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 hover:shadow-lg disabled:opacity-40 transition-all active:scale-90"
            id="chat-submit-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
