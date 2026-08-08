'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AIHelpProvider, setGlobalChatOpen } from '@/context/AIHelpContext';
import AIHelpFAB from './AIHelpFAB';
import AIHelpChat from './AIHelpChat';
import { LearningContext, UserContext, SubjectScore } from '@/types/aiHelp';

const AIHelpWrapper = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Hide AIHelpWrapper when in exam or review page
  const isExamPage = pathname?.includes('/exam');
  const isReviewPage = pathname?.includes('/review');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Update global state when chat opens/closes
  useEffect(() => {
    setGlobalChatOpen(isChatOpen);
  }, [isChatOpen]);
  const [learningContext, setLearningContext] = useState<LearningContext | null>(null);
  const [selectedCompanionId, setSelectedCompanionId] = useState('robo');

  // Listen for openAIHelp event from profile page
  const handleOpenAIHelp = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener('openAIHelp', handleOpenAIHelp);
    return () => {
      window.removeEventListener('openAIHelp', handleOpenAIHelp);
    };
  }, [handleOpenAIHelp]);

  // Listen for friendChange event
  const handleFriendChange = useCallback((event: any) => {
    const newFriendId = event.detail?.friendId;
    console.log('friendChange event received:', newFriendId);
    if (newFriendId) {
      setSelectedCompanionId(newFriendId);
      console.log('selectedCompanionId updated to:', newFriendId);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('friendChange', handleFriendChange);
    return () => {
      window.removeEventListener('friendChange', handleFriendChange);
    };
  }, [handleFriendChange]);

  useEffect(() => {
    if (!user) return;

    const fetchLearningData = async () => {
      try {
        // Fetch subjects
        const subjectsRes = await fetch(`/api/subjects?kelas=${user.kelas}&userId=${user.id}`);
        const subjectsData = await subjectsRes.json();

        // Fetch rewards
        const rewardsRes = await fetch(`/api/rewards/${user.id}`);
        const rewardsData = await rewardsRes.json();

        const subjects: SubjectScore[] = subjectsData.map((s: any) => ({
          id: s.id || s._id,
          nama: s.nama,
          highestScore: s.highestScore
        }));

        const lowScoreSubjects = subjects.filter(s => 
          s.highestScore !== null && s.highestScore < 70
        );
        const unattemptedSubjects = subjects.filter(s => 
          s.highestScore === null
        );
        const attemptedSubjects = subjects.filter(s => s.highestScore !== null);
        const averageScore = attemptedSubjects.length > 0
          ? Math.round(attemptedSubjects.reduce((sum, s) => sum + (s.highestScore || 0), 0) / attemptedSubjects.length)
          : 0;

        setLearningContext({
          subjects,
          recentScores: [],
          badges: rewardsData.badges || [],
          lowScoreSubjects,
          unattemptedSubjects,
          averageScore,
          totalQuizzesTaken: rewardsData.stats?.totalQuizzesTaken || 0,
          totalCoins: rewardsData.coins || 0
        });

        // Set selected companion
        if (rewardsData.stats?.selectedFriendId) {
          setSelectedCompanionId(rewardsData.stats.selectedFriendId);
        }
      } catch (err) {
        console.error('Error fetching learning data for AI Help:', err);
      }
    };

    fetchLearningData();
  }, [user]);

  if (!user || isExamPage || isReviewPage) return null;

  const userContext: UserContext = {
    id: user.id || '',
    username: user.username || '',
    kelas: user.kelas || '',
    avatar: user.avatar || ''
  };

  return (
    <AIHelpProvider>
      <AIHelpFAB 
        companionId={selectedCompanionId} 
        onClick={() => setIsChatOpen(true)} 
      />
      <AIHelpChat
        key={selectedCompanionId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        companionId={selectedCompanionId}
        user={userContext}
        learningContext={learningContext}
      />
    </AIHelpProvider>
  );
};

export default AIHelpWrapper;
