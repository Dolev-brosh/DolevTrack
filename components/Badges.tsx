import React, { useMemo } from 'react';
import { DailyLog, UserGoals } from '../types';
import { Card } from './Card';
import { Trophy } from 'lucide-react';

interface BadgesProps {
  logs: DailyLog[];
  userGoals: UserGoals | null;
}

const MILESTONES = [1, 10, 30, 50, 70, 100];

// CONFIGURATION: Unique images for each badge
// Replace the URLs below with your specific badge images.
export const BADGE_CONFIG: Record<'protein' | 'calories', Record<number, string>> = {
  protein: {
    1: "https://i.ibb.co/d0H9k3w2/1pro.png", 
    10: "https://i.ibb.co/Fbfv8FS3/Gemini-Generated-Image-bh4apobh4apobh4a-1-3.png",
    30: "https://i.ibb.co/Nnp34YMd/Gemini-Generated-Image-bh4apobh4apobh4a-1-4.png",
    50: "https://i.ibb.co/mVc974ZQ/Gemini-Generated-Image-bh4apobh4apobh4a-1-5.png",
    70: "https://i.ibb.co/S7ZFN7v8/Gemini-Generated-Image-bh4apobh4apobh4a-1-6.png",
    100: "https://i.ibb.co/ccJ2zzhd/Gemini-Generated-Image-bh4apobh4apobh4a-1-7.png",
  },
  calories: {
    1: "https://i.ibb.co/hF0XPFkM/Gemini-Generated-Image-bh4apobh4apobh4a-1-8.png",
    10: "https://i.ibb.co/tMsDc9z9/Gemini-Generated-Image-bh4apobh4apobh4a-1-9.png",
    30: "https://i.ibb.co/QvQDSSRr/Gemini-Generated-Image-bh4apobh4apobh4a-1-10.png",
    50: "https://i.ibb.co/1tkqFby0/Gemini-Generated-Image-bh4apobh4apobh4a-1-11.png",
    70: "https://i.ibb.co/j9K1JG2N/Gemini-Generated-Image-bh4apobh4apobh4a-1-12.png",
    100: "https://i.ibb.co/QFDzsgZL/Gemini-Generated-Image-bh4apobh4apobh4a-1-13.png",
  }
};

export const Badges: React.FC<BadgesProps> = ({ logs, userGoals }) => {
  
  // --- Streak Calculation Logic ---
  const streaks = useMemo(() => {
    if (!userGoals || logs.length === 0) return { protein: 0, calories: 0 };

    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    
    // Check protein: >= goal
    const checkProtein = (log: DailyLog) => log.protein >= userGoals.protein;
    // Check calories: <= goal + 150 buffer
    const checkCalories = (log: DailyLog) => log.calories <= (userGoals.calories + 150);

    const calculateStreak = (checkFn: (log: DailyLog) => boolean) => {
      let currentStreak = 0;
      let lastDate: Date | null = null;
      const latestLog = sortedLogs[0];
      if (!latestLog) return 0;

      for (let i = 0; i < sortedLogs.length; i++) {
        const log = sortedLogs[i];
        const logDate = new Date(log.date);

        if (i === 0) {
            if (checkFn(log)) {
                currentStreak++;
                lastDate = logDate;
            } else {
                break;
            }
        } else {
            if (!lastDate) break;
            const diffTime = Math.abs(lastDate.getTime() - logDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays === 1) {
                if (checkFn(log)) {
                    currentStreak++;
                    lastDate = logDate;
                } else {
                    break; 
                }
            } else if (diffDays === 0) {
                continue;
            } else {
                break;
            }
        }
      }
      return currentStreak;
    };

    return {
      protein: calculateStreak(checkProtein),
      calories: calculateStreak(checkCalories)
    };

  }, [logs, userGoals]);

  const BadgeItem = ({ 
    milestone, 
    currentStreak, 
    type 
  }: { 
    milestone: number, 
    currentStreak: number, 
    type: 'protein' | 'calories' 
  }) => {
    const isUnlocked = currentStreak >= milestone;
    const imageUrl = BADGE_CONFIG[type][milestone];

    // Sizing Logic
    // Protein: w-32 (128px)
    // Calories: Increase by 20% -> 128 * 1.2 ≈ 154px (9.6rem)
    const sizeClasses = type === 'calories' 
        ? 'w-[9.6rem] h-[9.6rem]' 
        : 'w-32 h-32';
    
    return (
      <div className={`relative flex flex-col items-center justify-center transition-all duration-500 ${isUnlocked ? 'opacity-100 scale-100' : 'opacity-40 grayscale scale-95'}`}>
        {/* Badge Container */}
        <div className={`relative ${sizeClasses} drop-shadow-2xl`}>
          
          {/* Badge Image */}
          <img 
            src={imageUrl} 
            alt={`${type} badge ${milestone}`}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback if local image not found
              e.currentTarget.src = type === 'protein' 
                ? "https://cdn-icons-png.flaticon.com/512/2382/2382461.png"
                : "https://cdn-icons-png.flaticon.com/512/763/763812.png";
            }}
          />
        </div>
      </div>
    );
  };

  if (!userGoals) {
      return (
          <Card className="text-center py-10">
              <Trophy className="mx-auto text-gray-500 mb-2" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Set Goals First</h3>
              <p className="text-gray-400">You need to set your daily goals in the "Goals" tab to start earning badges.</p>
          </Card>
      );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-8">
        
        {/* Streaks Summary */}
        <div className="grid grid-cols-2 gap-4">
            <Card className="flex flex-col items-center justify-center py-4 bg-gradient-to-br from-dark-800 to-blue-900/20 border-blue-900/30">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Protein Streak</span>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-white">{streaks.protein}</span>
                    <span className="text-sm text-blue-500 font-bold">Days</span>
                </div>
            </Card>
            <Card className="flex flex-col items-center justify-center py-4 bg-gradient-to-br from-dark-800 to-orange-900/20 border-orange-900/30">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Calorie Streak</span>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-white">{streaks.calories}</span>
                    <span className="text-sm text-orange-500 font-bold">Days</span>
                </div>
            </Card>
        </div>

        {/* Protein Section */}
        <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-dark-700 pb-2">
                Protein Collection
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-2 place-items-center">
                {MILESTONES.map(m => (
                    <BadgeItem key={`p-${m}`} milestone={m} currentStreak={streaks.protein} type="protein" />
                ))}
            </div>
        </div>

        {/* Calorie Section */}
        <div className="mt-4">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-dark-700 pb-2">
                Calorie Collection
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-2 place-items-center">
                {MILESTONES.map(m => (
                    <BadgeItem key={`c-${m}`} milestone={m} currentStreak={streaks.calories} type="calories" />
                ))}
            </div>
        </div>

    </div>
  );
};