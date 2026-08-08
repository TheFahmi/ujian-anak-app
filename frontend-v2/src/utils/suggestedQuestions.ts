/**
 * Suggested Questions Generator
 * Generates contextual questions based on user's learning data
 */

import { AIContext, AICompanion, UserContext } from '@/types/aiHelp';

const GENERAL_QUESTIONS = [
  'Berikan tips belajar yang efektif!',
  'Kuis apa yang sebaiknya aku coba?',
  'Bagaimana cara mengingat pelajaran dengan mudah?',
  'Apa yang harus aku pelajari hari ini?',
  'Bagaimana cara fokus saat belajar?'
];

const LOW_SCORE_TEMPLATES = [
  'Bagaimana cara belajar {subject} dengan lebih baik?',
  'Aku kesulitan di {subject}, bisa bantu?',
  'Tips untuk meningkatkan nilai {subject}?',
  'Kenapa {subject} terasa sulit?'
];

const UNATTEMPTED_TEMPLATES = [
  'Apa saja yang akan dipelajari di {subject}?',
  'Ceritakan tentang kuis {subject}!',
  'Apakah {subject} sulit?',
  'Aku mau coba kuis {subject}, ada tips?'
];

export const generateSuggestedQuestions = (context: AIContext | null): string[] => {
  const questions: string[] = [];
  const learning = context?.learning;
  const lowScoreSubjects = learning?.lowScoreSubjects || [];
  const unattemptedSubjects = learning?.unattemptedSubjects || [];

  if (lowScoreSubjects.length > 0) {
    const subject = lowScoreSubjects[0];
    const template = LOW_SCORE_TEMPLATES[Math.floor(Math.random() * LOW_SCORE_TEMPLATES.length)];
    questions.push(template.replace('{subject}', subject.nama));
  }

  if (unattemptedSubjects.length > 0) {
    const subject = unattemptedSubjects[0];
    const template = UNATTEMPTED_TEMPLATES[Math.floor(Math.random() * UNATTEMPTED_TEMPLATES.length)];
    questions.push(template.replace('{subject}', subject.nama));
  }

  const shuffledGeneral = [...GENERAL_QUESTIONS].sort(() => Math.random() - 0.5);
  while (questions.length < 4 && shuffledGeneral.length > 0) {
    questions.push(shuffledGeneral.shift()!);
  }

  return questions.slice(0, 4);
};

export const generateWelcomeMessage = (
  companion: AICompanion | null, 
  user: UserContext | null
): string => {
  const username = user?.username || 'Teman';
  const companionName = companion?.name || 'AI';

  const welcomeMessages: Record<string, string> = {
    robo: `Beep boop! Halo ${username}! Aku ${companionName}, siap membantumu belajar! Ada yang bisa kubantu hari ini?`,
    'prof-hoot': `Hoo hoo... Selamat datang, ${username}! Aku ${companionName}, guru bijak yang siap membimbingmu. Apa yang ingin kamu pelajari?`,
    cleo: `Meow! Hai ${username}! Aku ${companionName}, teman kreatifmu! Yuk kita belajar dengan cara yang seru!`,
    dino: `Roaar! Halo ${username}! Aku ${companionName}, siap berpetualang bersamamu! Ayo kita jelajahi dunia pengetahuan!`
  };

  return welcomeMessages[companion?.id || ''] || `Halo ${username}! Aku ${companionName}, siap membantumu belajar!`;
};

export default generateSuggestedQuestions;
