import React from 'react';
import { Trophy, FileText, Rocket } from 'lucide-react';

interface QuizCardProps {
    subject: any;
    onStart: (id: string) => void;
}

const getSubjectImage = (subject: any) => {
    if (!subject || !subject.nama) return '/images/quiz-general.svg';
    const lowerName = subject.nama.toLowerCase();
    if (lowerName.includes('matematika')) return '/images/quiz-math.svg';
    if (lowerName.includes('sains') || lowerName.includes('ipa')) return '/images/quiz-science.svg';
    if (lowerName.includes('sejarah') || lowerName.includes('ips')) return '/images/quiz-history.svg';
    if (lowerName.includes('bahasa')) return '/images/quiz-language.svg';
    if (lowerName.includes('hewan')) return '/images/quiz-animals.svg';
    if (lowerName.includes('geografi')) return '/images/quiz-geography.svg';
    if (lowerName.includes('seni')) return '/images/quiz-art.svg';
    if (lowerName.includes('musik')) return '/images/quiz-music.svg';
    if (lowerName.includes('olahraga')) return '/images/quiz-sports.svg';
    if (lowerName.includes('teknologi') || lowerName.includes('komputer')) return '/images/quiz-technology.svg';
    return '/images/quiz-general.svg';
};

export default function QuizCard({ subject, onStart }: QuizCardProps) {
    return (
        <div className="group flex-none w-[200px] bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] flex flex-col overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#cbd5e1]">
            <div
                className="w-full aspect-[3/2] bg-[length:60%] bg-[#f8fafc] bg-center bg-no-repeat border-b-2 border-[#e2e8f0]"
                style={{ backgroundImage: `url("${getSubjectImage(subject)}")` }}
            ></div>
            <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                <div>
                    <h3 className="font-[var(--font-fredoka)] text-lg text-[#0f172a] mb-1">{subject.nama}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{subject.highestScore !== null ? <Trophy className="inline w-5 h-5 text-yellow-500" /> : <FileText className="inline w-5 h-5 text-gray-500" />}</span>
                        <p className="text-sm text-[#64748b] font-medium">
                            {subject.highestScore !== null
                                ? `Skor Tertinggi: ${subject.highestScore}`
                                : 'Belum dicoba'}
                        </p>
                    </div>
                </div>
                <button
                    className="w-full py-3 rounded-xl bg-[#0f172a] text-white font-[var(--font-fredoka)] text-sm shadow-[0_4px_0_#f4c025] active:shadow-none active:translate-y-[4px] transition-all border-none cursor-pointer flex items-center justify-center gap-2"
                    onClick={() => onStart(subject.id)}
                >
                    <span>{subject.highestScore !== null ? 'Main Lagi' : 'Mulai Main'}</span>
                    <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
            </div>
        </div>
    );
}
