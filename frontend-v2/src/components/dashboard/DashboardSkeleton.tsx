import React from 'react';
import TopAppBar from '../TopAppBar';
import BottomNavigation from '../BottomNavigation';

export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#fdfbf7] font-['Lexend',sans-serif] pb-32 pt-4 text-[#0f172a] overflow-x-hidden max-w-md md:max-w-md lg:max-w-md mx-auto">
            <div className="md:hidden">
            <TopAppBar
                title="Halo, Teman!"
                avatarUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuAf4sYiGTsAtgl9F-1_3W58mCVOT-5kV55az_D8N-WSf3Kb7e5MVlTTAScPWgcz9exZFpXGPMJ-5EYUFgOVUj-qvymbqzGzi08xXU7I2rnJwkXWl6eNaMh8YlgXJyc4CKk4Ds6M0MrAK5klVMm3xZ4SWSDe-X0a1qZJ7QS8o65k_IEvdjobCV2hDcDPA2F5w2ugbp6_wN2IlpX9JtVEWDLEc1NwL19VI0Og1ikD4UMDLKf0uO_f1wndA36MNqdsZ72v1O6zItt1Uck"
            />
            </div>
            {/* Skeleton Loading State */}
            <div className="px-6 space-y-8 mt-4">
                {/* Quiz Seru Skeleton */}
                <div>
                    <div className="h-8 bg-gray-200 rounded-xl w-1/3 mb-4 animate-pulse"></div>
                    <div className="flex gap-5 overflow-hidden">
                        {[1, 2].map(i => (
                            <div key={i} className="w-[200px] h-[280px] bg-white rounded-3xl border-2 border-gray-100 flex-shrink-0 animate-pulse p-4 flex flex-col gap-4">
                                <div className="w-full h-32 bg-gray-200 rounded-2xl"></div>
                                <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                                <div className="mt-auto h-10 bg-gray-200 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Teman Belajar Skeleton */}
                <div>
                    <div className="h-8 bg-gray-200 rounded-xl w-1/2 mb-4 animate-pulse"></div>
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-28 h-28 bg-gray-200 rounded-2xl animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded-lg w-16 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hadiah Skeleton */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div className="h-8 bg-gray-200 rounded-xl w-1/3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-lg w-16 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-square bg-white rounded-2xl border-2 border-gray-100 animate-pulse p-2 flex flex-col items-center justify-center gap-2">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="h-3 bg-gray-200 rounded-lg w-12"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <BottomNavigation />
        </div>
    );
}
