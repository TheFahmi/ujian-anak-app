// Simple DTOs without class-validator decorators

export interface UserContextDto {
  id: string;
  username: string;
  kelas: string;
  avatar?: string;
}

export interface SubjectScoreDto {
  id: string;
  nama: string;
  highestScore?: number | null;
}

export interface LearningContextDto {
  subjects: SubjectScoreDto[];
  recentScores: number[];
  badges: string[];
  lowScoreSubjects: SubjectScoreDto[];
  unattemptedSubjects: SubjectScoreDto[];
  averageScore?: number;
  totalQuizzesTaken?: number;
  totalCoins?: number;
}

export interface CompanionContextDto {
  id: string;
  name: string;
  role: string;
  personality: string;
  systemPrompt: string;
}

export interface SessionContextDto {
  id: string;
  timestamp: string;
  messageCount?: number;
}

export interface AIContextDto {
  user?: UserContextDto;
  learning: LearningContextDto;
  companion?: CompanionContextDto;
  session: SessionContextDto;
}

export class MessageDto {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Use class instead of interface for NestJS decorator compatibility
export class ChatRequestDto {
  message: string;
  context: AIContextDto;
  conversationHistory?: MessageDto[];
}

export interface TokenUsageDto {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export class ChatResponseDto {
  success: boolean;
  response: string;
  suggestedFollowUps?: string[];
  tokenUsage?: TokenUsageDto;
}
