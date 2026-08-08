import { useState, useCallback } from 'react';
import { buildAIContext } from '@/utils/aiContextBuilder';
import { ChatResponse, LearningContext, AICompanion } from '@/types/aiHelp';

interface UserData {
  id?: string;
  _id?: string;
  username?: string;
  kelas?: string;
  avatar?: string;
}

interface UseAIHelpOptions {
  user: UserData | null;
  companion: string | AICompanion;
  learningContext: LearningContext | null;
}

interface UseAIHelpReturn {
  sendMessage: (content: string, conversationHistory?: unknown[]) => Promise<ChatResponse | null>;
  isLoading: boolean;
  error: Error | null;
  clearError: () => void;
}

const useAIHelp = ({ user, companion, learningContext }: UseAIHelpOptions): UseAIHelpReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (
    content: string, 
    conversationHistory: unknown[] = []
  ): Promise<ChatResponse | null> => {
    if (!content || content.trim() === '') {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const context = buildAIContext({
        user,
        learningData: learningContext ? { subjects: learningContext.subjects, badges: learningContext.badges } : null,
        companion,
        sessionId: `session_${Date.now()}`,
        messageCount: conversationHistory.length
      });

      // Optimize: limit history to 6 messages and truncate long messages
      const optimizedHistory = conversationHistory
        .slice(-6) // Keep only last 6 messages (3 exchanges)
        .map((msg: any) => ({
          ...msg,
          content: msg.content?.length > 500 
            ? msg.content.slice(0, 500) + '...' 
            : msg.content
        }));

      // Truncate user message if too long
      const truncatedMessage = content.trim().length > 500 
        ? content.trim().slice(0, 500) + '...'
        : content.trim();

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: truncatedMessage,
          context,
          conversationHistory: optimizedHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Terlalu banyak permintaan. Tunggu sebentar ya! ');
        }
        if (response.status === 503) {
          throw new Error('Layanan AI sedang sibuk. Coba lagi nanti ya! ');
        }
        
        throw new Error(errorData.error || 'Gagal mendapatkan respons');
      }

      const data: ChatResponse = await response.json();
      return data;

    } catch (err) {
      console.error('useAIHelp error:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, companion, learningContext]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    clearError
  };
};

export default useAIHelp;
