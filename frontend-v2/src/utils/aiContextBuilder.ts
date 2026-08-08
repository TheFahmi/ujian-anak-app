/**
 * AI Context Builder Utility
 * Builds structured context for AI chat sessions
 */

import { getCompanionById } from './aiCompanions';
import { 
  AIContext, 
  UserContext, 
  LearningContext, 
  SessionContext,
  AICompanion,
  SubjectScore 
} from '@/types/aiHelp';

interface UserData {
  id?: string;
  _id?: string;
  username?: string;
  kelas?: string;
  avatar?: string;
}

interface LearningData {
  subjects?: SubjectScore[];
  scores?: number[];
  badges?: string[];
  stats?: {
    totalQuizzesTaken?: number;
    coins?: number;
  };
}

export const buildUserSection = (user: UserData | null): UserContext | null => {
  if (!user) return null;
  
  return {
    id: user.id || user._id || '',
    username: user.username || '',
    kelas: user.kelas || '',
    avatar: user.avatar || ''
  };
};

export const buildLearningSection = (learningData: LearningData | null): LearningContext => {
  const {
    subjects = [],
    scores = [],
    badges = [],
    stats = {}
  } = learningData || {};

  // Only get subjects with low scores (limit to 3 for token optimization)
  const lowScoreSubjects = subjects
    .filter(s => s.highestScore !== null && s.highestScore < 70)
    .slice(0, 3);

  // Only get first 3 unattempted subjects
  const unattemptedSubjects = subjects
    .filter(s => s.highestScore === null || s.highestScore === undefined)
    .slice(0, 3);

  const attemptedSubjects = subjects.filter(s => s.highestScore !== null);
  const averageScore = attemptedSubjects.length > 0
    ? Math.round(attemptedSubjects.reduce((sum, s) => sum + (s.highestScore || 0), 0) / attemptedSubjects.length)
    : 0;

  return {
    // Don't send full subjects list - too many tokens
    subjects: [],
    recentScores: scores.slice(0, 3), // Reduced from 5 to 3
    badges: badges.slice(0, 5), // Limit badges
    // Only send essential data
    lowScoreSubjects: lowScoreSubjects.map(s => ({
      id: s.id,
      nama: s.nama,
      highestScore: s.highestScore
    })),
    unattemptedSubjects: unattemptedSubjects.map(s => ({
      id: s.id,
      nama: s.nama,
      highestScore: null
    })),
    averageScore,
    totalQuizzesTaken: stats.totalQuizzesTaken || 0,
    totalCoins: stats.coins || 0
  };
};

export const buildCompanionSection = (companion: string | AICompanion): Omit<AICompanion, 'image'> | null => {
  const companionData = typeof companion === 'string' 
    ? getCompanionById(companion) 
    : companion;

  if (!companionData) return null;

  return {
    id: companionData.id,
    name: companionData.name,
    role: companionData.role,
    personality: companionData.personality,
    systemPrompt: companionData.systemPrompt
  };
};

export const buildSessionSection = (sessionId?: string, messageCount = 0): SessionContext => {
  return {
    id: sessionId || `session_${Date.now()}`,
    timestamp: new Date().toISOString(),
    messageCount
  };
};

interface BuildAIContextOptions {
  user: UserData | null;
  learningData: LearningData | null;
  companion: string | AICompanion;
  sessionId?: string;
  messageCount?: number;
}

export const buildAIContext = ({ 
  user, 
  learningData, 
  companion, 
  sessionId, 
  messageCount = 0 
}: BuildAIContextOptions): AIContext => {
  return {
    user: buildUserSection(user),
    learning: buildLearningSection(learningData),
    companion: buildCompanionSection(companion),
    session: buildSessionSection(sessionId, messageCount)
  };
};

export const validateAIContext = (context: AIContext): boolean => {
  if (!context) return false;
  
  const requiredSections: (keyof AIContext)[] = ['user', 'learning', 'companion', 'session'];
  return requiredSections.every(section => Object.prototype.hasOwnProperty.call(context, section));
};

export default buildAIContext;
