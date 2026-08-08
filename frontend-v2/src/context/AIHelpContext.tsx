'use client';

import React, { createContext, useState, useContext, useCallback, useRef, ReactNode } from 'react';
import { Message, AIHelpContextValue, ChatResponse } from '@/types/aiHelp';

const AIHelpContext = createContext<AIHelpContextValue | null>(null);

// Global state for chat visibility (accessible outside provider)
let globalChatOpenState = false;
let globalChatOpenListeners: ((isOpen: boolean) => void)[] = [];

export const setGlobalChatOpen = (isOpen: boolean) => {
  globalChatOpenState = isOpen;
  globalChatOpenListeners.forEach(listener => listener(isOpen));
};

export const subscribeToGlobalChatOpen = (listener: (isOpen: boolean) => void) => {
  globalChatOpenListeners.push(listener);
  return () => {
    globalChatOpenListeners = globalChatOpenListeners.filter(l => l !== listener);
  };
};

export const getGlobalChatOpen = () => globalChatOpenState;

export const useAIHelpContext = () => {
  const context = useContext(AIHelpContext);
  if (!context) {
    throw new Error('useAIHelpContext must be used within AIHelpProvider');
  }
  return context;
};

interface AIHelpProviderProps {
  children: ReactNode;
}

export const AIHelpProvider = ({ children }: AIHelpProviderProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const sessionIdRef = useRef(`session_${Date.now()}`);

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addMessage = useCallback((role: 'user' | 'assistant', content: string): Message => {
    const newMessage: Message = {
      id: generateMessageId(),
      role,
      content,
      timestamp: new Date(),
      reaction: null
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (
    content: string, 
    apiCall: (content: string) => Promise<ChatResponse>
  ): Promise<Message | null> => {
    if (!content || content.trim() === '') {
      return null;
    }

    addMessage('user', content.trim());
    setIsLoading(true);

    try {
      const response = await apiCall(content.trim());
      const aiMessage = addMessage('assistant', response.response);
      
      if (response.suggestedFollowUps) {
        setSuggestedQuestions(response.suggestedFollowUps);
      }
      
      return aiMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Ups, ada masalah. Coba lagi ya!');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    sessionIdRef.current = `session_${Date.now()}`;
  }, []);

  const addReaction = useCallback((messageId: string, reaction: 'thumbs_up' | 'thumbs_down') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, reaction } : msg
    ));
  }, []);

  const updateSuggestedQuestions = useCallback((questions: string[]) => {
    setSuggestedQuestions(questions);
  }, []);

  const getSessionId = useCallback(() => sessionIdRef.current, []);

  const value: AIHelpContextValue = {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    addReaction,
    suggestedQuestions,
    updateSuggestedQuestions,
    getSessionId,
    addMessage
  };

  return (
    <AIHelpContext.Provider value={value}>
      {children}
    </AIHelpContext.Provider>
  );
};

export default AIHelpContext;
