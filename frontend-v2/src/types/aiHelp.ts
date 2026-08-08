/**
 * AI Help Support Types
 */

export interface AICompanion {
  id: 'robo' | 'prof-hoot' | 'cleo' | 'dino';
  name: string;
  image: string;
  role: string;
  personality: string;
  systemPrompt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  reaction?: 'thumbs_up' | 'thumbs_down' | null;
}

export interface UserContext {
  id: string;
  username: string;
  kelas: string;
  avatar: string;
}

export interface SubjectScore {
  id: string;
  nama: string;
  highestScore: number | null;
}

export interface LearningContext {
  subjects: SubjectScore[];
  recentScores: number[];
  badges: string[];
  lowScoreSubjects: SubjectScore[];
  unattemptedSubjects: SubjectScore[];
  averageScore: number;
  totalQuizzesTaken: number;
  totalCoins: number;
}

export interface SessionContext {
  id: string;
  timestamp: string;
  messageCount: number;
}

export interface AIContext {
  user: UserContext | null;
  learning: LearningContext;
  companion: Omit<AICompanion, 'image'> | null;
  session: SessionContext;
}

export interface ChatRequest {
  message: string;
  context: AIContext;
  conversationHistory: Message[];
}

export interface ChatResponse {
  success: boolean;
  response: string;
  suggestedFollowUps?: string[];
}

export interface AIHelpContextValue {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string, apiCall: (content: string) => Promise<ChatResponse>) => Promise<Message | null>;
  clearMessages: () => void;
  addReaction: (messageId: string, reaction: 'thumbs_up' | 'thumbs_down') => void;
  suggestedQuestions: string[];
  updateSuggestedQuestions: (questions: string[]) => void;
  getSessionId: () => string;
  addMessage: (role: 'user' | 'assistant', content: string) => Message;
}
