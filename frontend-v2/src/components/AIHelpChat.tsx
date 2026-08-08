'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Lightbulb, Smile } from 'lucide-react';
import Image from 'next/image';
import { useAIHelpContext } from '@/context/AIHelpContext';
import { getCompanionById } from '@/utils/aiCompanions';
import { generateSuggestedQuestions, generateWelcomeMessage } from '@/utils/suggestedQuestions';
import { buildAIContext } from '@/utils/aiContextBuilder';
import { FormattedMessage } from '@/utils/chatFormatter';
import { LearningContext, UserContext } from '@/types/aiHelp';

interface AIHelpChatProps {
  isOpen: boolean;
  onClose: () => void;
  companionId?: string;
  user: UserContext | null;
  learningContext: LearningContext | null;
}

const AIHelpChat = ({ 
  isOpen, 
  onClose, 
  companionId = 'robo', 
  user, 
  learningContext 
}: AIHelpChatProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    addReaction,
    suggestedQuestions,
    updateSuggestedQuestions,
    addMessage,
    getSessionId
  } = useAIHelpContext();

  const companion = getCompanionById(companionId);

  useEffect(() => {
    if (isOpen && learningContext) {
      const context = buildAIContext({
        user,
        learningData: { subjects: learningContext.subjects, badges: learningContext.badges },
        companion: companionId,
        sessionId: getSessionId()
      });
      const questions = generateSuggestedQuestions(context);
      updateSuggestedQuestions(questions);
    }
  }, [isOpen, learningContext, companionId, user, updateSuggestedQuestions, getSessionId]);


  useEffect(() => {
    if (isOpen && messages.length === 0 && companion && user) {
      const welcomeMsg = generateWelcomeMessage(companion, user);
      addMessage('assistant', welcomeMsg);
    }
  }, [isOpen, messages.length, companion, user, addMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isLoading) {
      resetIdleTimer();
    }
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isOpen, isLoading, messages]);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    setShowIdlePrompt(false);
    idleTimerRef.current = setTimeout(() => {
      setShowIdlePrompt(true);
    }, 30000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue.trim();
    setInputValue('');
    resetIdleTimer();

    const context = buildAIContext({
      user,
      learningData: learningContext ? { subjects: learningContext.subjects, badges: learningContext.badges } : null,
      companion: companionId,
      sessionId: getSessionId(),
      messageCount: messages.length
    });

    try {
      await sendMessage(messageContent, async (content) => {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            context,
            conversationHistory: messages.slice(-10)
          })
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        return await response.json();
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const handleReaction = (messageId: string, reaction: 'thumbs_up' | 'thumbs_down') => {
    addReaction(messageId, reaction);
  };

  if (!isOpen) return null;


  return (
    <div 
      className="fixed inset-0 z-[1001] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md h-[85vh] bg-[#fdfbf7] rounded-t-3xl shadow-2xl flex flex-col animate-slideUp overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-[#f4c025] border-b-[3px] border-[#0f172a]">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-[#0f172a] overflow-hidden shadow-[2px_2px_0px_#0f172a] relative">
            <Image src={companion.image} alt={companion.name} fill className="object-cover" sizes="48px" />
          </div>
          <div className="flex-1">
            <h3 className="font-[var(--font-fredoka)] text-lg text-[#0f172a] m-0">{companion.name}</h3>
            <p className="text-xs text-[#0f172a]/70 m-0">{companion.role}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border-2 border-[#0f172a] flex items-center justify-center shadow-[2px_2px_0px_#0f172a] hover:bg-gray-100 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span className="material-symbols-outlined text-[#0f172a]">close</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-[#e2e8f0] overflow-hidden flex-shrink-0 relative">
                      <Image src={companion.image} alt="" fill className="object-cover" sizes="32px" />
                    </div>
                    <div>
                      <div className="bg-white rounded-2xl rounded-tl-sm p-3 border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0]">
                        <FormattedMessage content={msg.content} className="text-sm text-[#0f172a] m-0" />
                      </div>
                      <div className="flex gap-1 mt-1 ml-1">
                        <button
                          onClick={() => handleReaction(msg.id, 'thumbs_up')}
                          className={`p-1 rounded-full transition-all ${msg.reaction === 'thumbs_up' ? 'bg-green-100 scale-110' : 'hover:bg-gray-100'}`}
                        >
                          <ThumbsUp className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleReaction(msg.id, 'thumbs_down')}
                          className={`p-1 rounded-full transition-all ${msg.reaction === 'thumbs_down' ? 'bg-red-100 scale-110' : 'hover:bg-gray-100'}`}
                        >
                          <ThumbsDown className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="bg-[#2b8cee] rounded-2xl rounded-tr-sm p-3 border-2 border-[#1a6bb5] shadow-[2px_2px_0px_#1a6bb5]">
                    <FormattedMessage content={msg.content} className="text-sm text-white m-0" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#e2e8f0] overflow-hidden flex-shrink-0 relative">
                  <Image src={companion.image} alt="" fill className="object-cover" sizes="32px" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm p-3 border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0]">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#64748b] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-[#64748b] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-[#64748b] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showIdlePrompt && !isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#fef3c7] rounded-2xl p-3 border-2 border-[#f4c025] max-w-[80%]">
                <p className="text-sm text-[#0f172a] m-0">
                  <span className="inline-flex items-center gap-1"><Lightbulb className="inline w-4 h-4 text-yellow-500" /> Masih ada yang ingin kamu tanyakan? Aku siap membantu! <Smile className="inline w-4 h-4 text-yellow-500" /></span>
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>


        {/* Suggested Questions */}
        {messages.length <= 1 && suggestedQuestions.length > 0 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-[#64748b] mb-2"><span className="inline-flex items-center gap-1"><Lightbulb className="inline w-3 h-3" /> Coba tanyakan:</span></p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1.5 bg-white rounded-full border-2 border-[#e2e8f0] text-xs text-[#0f172a] font-medium hover:bg-[#f1f5f9] hover:border-[#2b8cee] transition-all active:scale-95"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t-2 border-[#e2e8f0]">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pertanyaanmu..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 rounded-xl bg-[#2b8cee] border-2 border-[#1a6bb5] shadow-[2px_2px_0px_#1a6bb5] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1e7cd9] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHelpChat;
