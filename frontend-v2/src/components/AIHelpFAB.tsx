'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { getCompanionById } from '@/utils/aiCompanions';

interface AIHelpFABProps {
  companionId?: string;
  onClick: () => void;
}

const AIHelpFAB = ({ companionId = 'robo', onClick }: AIHelpFABProps) => {
  const companion = getCompanionById(companionId);

  return (
    <button
      onClick={onClick}
      className="fixed bottom-32 right-4 z-40 w-14 h-14 rounded-full bg-[#f4c025] border-[3px] border-[#0f172a] shadow-[4px_4px_0px_#0f172a] flex items-center justify-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0f172a] active:translate-y-1 active:shadow-[2px_2px_0px_#0f172a] group"
      aria-label={`Tanya ${companion.name}`}
      title={`Tanya ${companion.name}`}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-[#0f172a] relative">
        <Image
          src={companion.image}
          alt={companion.name}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
      
      {/* Pulse animation */}
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2b8cee] rounded-full border-2 border-white animate-pulse"></span>
      
      {/* Tooltip on hover */}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-[#0f172a] text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Tanya {companion.name}! <MessageCircle className="inline w-4 h-4" />
      </span>
    </button>
  );
};

export default AIHelpFAB;
