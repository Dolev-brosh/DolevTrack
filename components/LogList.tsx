import React, { useState, useEffect } from 'react';
import { DailyLog, UserGoals } from '../types';
import { Card } from './Card';
import { Edit2, Trash2, ChevronDown, ChevronUp, Droplets, Wheat, Cookie, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogListProps {
  logs: DailyLog[];
  onEdit: (log: DailyLog) => void;
  onDelete: (date: string) => void;
  initialExpandedDate?: string | null;
  highlightedFields?: string[];
  userGoals: UserGoals | null;
}

export const LogList: React.FC<LogListProps> = ({ 
  logs, 
  onEdit, 
  onDelete, 
  initialExpandedDate,
  highlightedFields = [],
  userGoals
}) => {
  const [expandedDate, setExpandedDate] = useState<string | null>(initialExpandedDate || null);

  // Auto-scroll to the expanded item on mount if provided
  useEffect(() => {
    if (initialExpandedDate) {
      setTimeout(() => {
        const element = document.getElementById(`log-row-${initialExpandedDate}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [initialExpandedDate]);

  // Sort by date descending
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  const toggleRow = (date: string) => {
    if (expandedDate === date) {
      setExpandedDate(null);
    } else {
      setExpandedDate(date);
    }
  };

  // Helper to check if a specific field should flash
  const shouldFlash = (logDate: string, fieldName: string) => {
    return initialExpandedDate === logDate && highlightedFields.includes(fieldName);
  };

  if (logs.length === 0) {
    return (
        <Card className="text-center py-12">
            <ClipboardList className="mx-auto text-gray-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
            <p className="text-gray-400">Start logging your daily nutrition to see your history here.</p>
        </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="pt-6 pl-6 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          History
        </h3>
      </div>
      
      {/* Grid Header */}
      <div className="grid grid-cols-[1.5fr_1fr_1fr_40px] bg-dark-900/50 border-b border-dark-700 px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-bold items-center">
        <div>Date</div>
        <div>Weight</div>
        <div>Cals</div>
        <div className="text-right"></div>
      </div>

      <div className="flex flex-col">
        <AnimatePresence initial={false} mode="popLayout">
          {sortedLogs.map((log) => {
            const isExpanded = expandedDate === log.date;
            
            // Determine Calorie Color based on Goals (Goal + 150 buffer is success)
            const calorieColor = userGoals 
                ? (log.calories <= userGoals.calories + 150
                    ? 'text-neon-600 dark:text-neon-400' 
                    : 'text-red-600 dark:text-red-400')
                : 'text-neon-600 dark:text-neon-400';

            // Check if both goals met (Calories <= Goal+150 AND Protein >= Goal)
            const metBothGoals = userGoals && (log.calories <= userGoals.calories + 150) && (log.protein >= userGoals.protein);

            return (
              <motion.div
                key={log.date}
                id={`log-row-${log.date}`}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`border-b border-dark-700 last:border-0 overflow-hidden ${isExpanded ? 'bg-gray-50 dark:bg-dark-700/60' : 'hover:bg-gray-50 dark:hover:bg-dark-700/30'}`}
              >
                 {/* Main Row Click Area */}
                 <div 
                    onClick={() => toggleRow(log.date)}
                    className="grid grid-cols-[1.5fr_1fr_1fr_40px] px-4 py-4 items-center cursor-pointer transition-colors"
                 >
                    <div className="font-medium text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1.5">
                      {metBothGoals && <span title="Perfect Day!">👑</span>}
                      {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    
                    <div className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {log.weight > 0 ? (
                        <span className={`inline-block ${shouldFlash(log.date, 'weight') ? 'animate-flash font-bold' : ''}`}>
                            {log.weight}kg
                        </span>
                      ) : '-'}
                    </div>
                    
                    <div className={`${calorieColor} font-bold whitespace-nowrap`}>
                       <span className={`inline-block ${shouldFlash(log.date, 'calories') ? 'animate-flash' : ''}`}>
                          {log.calories}
                       </span>
                    </div>
                    
                    <div className="text-right text-gray-400 flex justify-end">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                 </div>

                 {/* Expanded Details */}
                 <AnimatePresence>
                   {isExpanded && (
                     <motion.div
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="overflow-hidden"
                     >
                       <div className="px-4 pb-3 pt-3 bg-gray-50 dark:bg-dark-900/40 shadow-inner">
                          <div className="flex flex-col gap-3">
                            {/* Macros Grid */}
                            <div className="grid grid-cols-3 gap-3 mt-2">
                              <div className="bg-transparent dark:bg-dark-800 rounded-xl p-3 border border-dark-700 flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                                  <Droplets size={12} /> Protein
                                </div>
                                <span className={`text-xl font-bold text-gray-900 dark:text-white inline-block ${shouldFlash(log.date, 'protein') ? 'animate-flash' : ''}`}>
                                    {log.protein}g
                                </span>
                              </div>
                              
                              <div className="bg-transparent dark:bg-dark-800 rounded-xl p-3 border border-dark-700 flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400 mb-1">
                                  <Wheat size={12} /> Carbs
                                </div>
                                <span className={`text-xl font-bold text-gray-900 dark:text-white inline-block ${shouldFlash(log.date, 'carbs') ? 'animate-flash' : ''}`}>
                                    {log.carbs}g
                                </span>
                              </div>

                              <div className="bg-transparent dark:bg-dark-800 rounded-xl p-3 border border-dark-700 flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                                  <Cookie size={12} /> Fat
                                </div>
                                <span className={`text-xl font-bold text-gray-900 dark:text-white inline-block ${shouldFlash(log.date, 'fat') ? 'animate-flash' : ''}`}>
                                    {log.fat}g
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-6 justify-between w-full pt-0">
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onEdit(log);
                                }}
                                className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium px-4 py-2 rounded-lg transition-colors"
                              >
                                <Edit2 size={18} /> Edit Entry
                              </button>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onDelete(log.date);
                                }}
                                className="flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-medium px-4 py-2 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} /> Delete
                              </button>
                            </div>
                          </div>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
};