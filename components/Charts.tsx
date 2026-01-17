import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DailyLog, UserGoals } from '../types';
import { Card } from './Card';
import { TrendingDown, TrendingUp, Minus, Flame, BarChart2 } from 'lucide-react';

interface ChartsProps {
  logs: DailyLog[];
  userGoals: UserGoals | null;
  theme?: 'light' | 'dark';
}

// Helper to get local YYYY-MM-DD string
const getLocalISODate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

export const Charts: React.FC<ChartsProps> = ({ logs, userGoals, theme = 'dark' }) => {
  // Sort logs by date ascending for charts
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  // Theme constants
  const axisColor = theme === 'dark' ? '#71717a' : '#6b7280'; // zinc-500 vs gray-500
  const gridColor = theme === 'dark' ? '#27272a' : '#e5e7eb'; // zinc-800 vs gray-200
  const tooltipBg = theme === 'dark' ? '#18181b' : '#ffffff'; // zinc-900 vs white
  const tooltipBorder = theme === 'dark' ? '#3f3f46' : '#e5e7eb'; // zinc-700 vs gray-200
  const tooltipText = theme === 'dark' ? '#e4e4e7' : '#111827'; // zinc-200 vs gray-900

  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
  
  // Calculate start of current week (Sunday)
  const startOfCurrentWeek = new Date(today);
  startOfCurrentWeek.setDate(today.getDate() - currentDayOfWeek);
  
  // Calculate end of current week (Saturday)
  const endOfCurrentWeek = new Date(startOfCurrentWeek);
  endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);

  // --- Weekly Balance Calculation ---
  const getWeeklyStats = () => {
    if (!userGoals) return null;

    const startStr = getLocalISODate(startOfCurrentWeek);
    const endStr = getLocalISODate(endOfCurrentWeek);

    // Filter logs for current week (inclusive)
    const weeklyLogs = logs.filter(l => l.date >= startStr && l.date <= endStr);
    
    // Calculate Totals
    const totalConsumed = weeklyLogs.reduce((acc, log) => acc + log.calories, 0);
    const totalProtein = weeklyLogs.reduce((acc, log) => acc + log.protein, 0);
    const totalCarbs = weeklyLogs.reduce((acc, log) => acc + log.carbs, 0);
    const totalFat = weeklyLogs.reduce((acc, log) => acc + log.fat, 0);

    // Calculate Goals (Daily * 7)
    const weeklyCalorieGoal = userGoals.calories * 7;
    const weeklyProteinGoal = userGoals.protein * 7;
    const weeklyCarbsGoal = userGoals.carbs * 7;
    const weeklyFatGoal = userGoals.fat * 7;

    const percentUsed = Math.min(100, Math.round((totalConsumed / weeklyCalorieGoal) * 100));

    return {
      calories: {
        current: totalConsumed,
        total: weeklyCalorieGoal,
        percent: percentUsed,
        rawPercent: Math.round((totalConsumed / weeklyCalorieGoal) * 100)
      },
      protein: {
        current: totalProtein,
        total: weeklyProteinGoal,
        percent: Math.min(100, Math.round((totalProtein / weeklyProteinGoal) * 100))
      },
      carbs: {
        current: totalCarbs,
        total: weeklyCarbsGoal,
        percent: Math.min(100, Math.round((totalCarbs / weeklyCarbsGoal) * 100))
      },
      fat: {
        current: totalFat,
        total: weeklyFatGoal,
        percent: Math.min(100, Math.round((totalFat / weeklyFatGoal) * 100))
      }
    };
  };

  // --- Weekly Weight Average Calculation ---
  const getWeeklyWeightStats = () => {
    // Last Week Dates
    const startOfLastWeek = new Date(startOfCurrentWeek);
    startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);

    const currentWeekStartStr = getLocalISODate(startOfCurrentWeek);
    const currentWeekEndStr = getLocalISODate(endOfCurrentWeek);
    const lastWeekStartStr = getLocalISODate(startOfLastWeek);
    const lastWeekEndStr = getLocalISODate(endOfLastWeek);

    // Calculate Average Function
    const calculateAvgWeight = (startDate: string, endDate: string) => {
        const weekLogs = logs.filter(l => 
            l.date >= startDate && 
            l.date <= endDate && 
            l.weight > 0 // Only count logs with weight
        );
        
        if (weekLogs.length === 0) return 0;
        const sum = weekLogs.reduce((acc, curr) => acc + curr.weight, 0);
        return sum / weekLogs.length;
    };

    const currentAvg = calculateAvgWeight(currentWeekStartStr, currentWeekEndStr);
    const lastAvg = calculateAvgWeight(lastWeekStartStr, lastWeekEndStr);

    return {
        currentAvg,
        lastAvg,
        diff: currentAvg - lastAvg
    };
  };

  const weeklyStats = getWeeklyStats();
  const weightStats = getWeeklyWeightStats();

  // Gauge Colors
  // Use rawPercent for color decision to show red if over 100%
  const gaugeColor = (weeklyStats?.calories.rawPercent || 0) > 100 ? '#ef4444' : '#a3e635'; // Red if over, Neon if under
  const emptyColor = theme === 'dark' ? '#27272a' : '#e5e7eb';

  // Calculate End Angle for Progress Pie
  // 180 is start (Left). 0 is end (Right).
  // We want to go clockwise from 180.
  // Formula: 180 - (180 * percent)
  // Clamp percent to 1 (100%) for the visual bar so it doesn't wrap around
  const progressEndAngle = weeklyStats 
    ? 180 - (180 * Math.min(weeklyStats.calories.percent, 100) / 100)
    : 180;
  
  // Radius settings for thicker gauge
  const outerRadius = 115;
  const innerRadius = 80;

  if (logs.length === 0) {
    return (
        <Card className="text-center py-12">
            <BarChart2 className="mx-auto text-gray-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">No Stats Available</h3>
            <p className="text-gray-400">Once you start logging entries, your statistics and trends will appear here.</p>
        </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      
      {/* 1. Calories Gauge Card */}
      {weeklyStats && (
        <>
          <Card title="Calorie Banking Weekly" className="flex flex-col items-center pt-2 pb-6">
              <div className="relative w-full h-[140px] flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          {/* Background Track (Full Semi-Circle) */}
                          <Pie
                              data={[{ value: 1 }]}
                              dataKey="value"
                              cx="50%"
                              cy="100%"
                              startAngle={180}
                              endAngle={0}
                              innerRadius={innerRadius}
                              outerRadius={outerRadius}
                              fill={emptyColor}
                              stroke="none"
                              cornerRadius={6}
                              isAnimationActive={false}
                          />
                          {/* Progress Fill (Overlays the track) */}
                          <Pie
                              data={[{ value: 1 }]}
                              dataKey="value"
                              cx="50%"
                              cy="100%"
                              startAngle={180}
                              endAngle={progressEndAngle}
                              innerRadius={innerRadius}
                              outerRadius={outerRadius}
                              fill={gaugeColor}
                              stroke="none"
                              cornerRadius={6}
                          />
                      </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Text */}
                  <div className="absolute bottom-0 flex flex-col items-center pb-1">
                      <Flame className={weeklyStats.calories.rawPercent > 100 ? "text-red-500 mb-3" : "text-neon-500 mb-3"} size={22} />
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                            {weeklyStats.calories.current.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 font-bold uppercase leading-none">
                            / {weeklyStats.calories.total}
                        </span>
                      </div>
                  </div>
              </div>
          </Card>

          {/* 2. Three Macro Cards Grid */}
          <div className="grid grid-cols-3 gap-4">
              
              {/* Carbs Card */}
              <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700 shadow-xl flex flex-col justify-between h-[110px]">
                  <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Carbs</span>
                  </div>
                  <div className="flex flex-col gap-2">
                      <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {weeklyStats.carbs.current}
                          </span>
                          <span className="text-[10px] text-gray-400">
                              / {weeklyStats.carbs.total}g
                          </span>
                      </div>
                      {/* Thicker Bar (h-3) */}
                      <div className="h-3 w-full bg-gray-200 dark:bg-dark-900 rounded-full overflow-hidden">
                          <div 
                              className="h-full bg-yellow-500 rounded-full" 
                              style={{ width: `${weeklyStats.carbs.percent}%` }}
                          />
                      </div>
                  </div>
              </div>

               {/* Protein Card */}
               <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700 shadow-xl flex flex-col justify-between h-[110px]">
                  <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Protein</span>
                  </div>
                  <div className="flex flex-col gap-2">
                      <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {weeklyStats.protein.current}
                          </span>
                          <span className="text-[10px] text-gray-400">
                              / {weeklyStats.protein.total}g
                          </span>
                      </div>
                      {/* Thicker Bar (h-3) */}
                      <div className="h-3 w-full bg-gray-200 dark:bg-dark-900 rounded-full overflow-hidden">
                          <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${weeklyStats.protein.percent}%` }}
                          />
                      </div>
                  </div>
              </div>

               {/* Fat Card */}
               <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700 shadow-xl flex flex-col justify-between h-[110px]">
                  <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Fat</span>
                  </div>
                  <div className="flex flex-col gap-2">
                      <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {weeklyStats.fat.current}
                          </span>
                          <span className="text-[10px] text-gray-400">
                              / {weeklyStats.fat.total}g
                          </span>
                      </div>
                      {/* Thicker Bar (h-3) */}
                      <div className="h-3 w-full bg-gray-200 dark:bg-dark-900 rounded-full overflow-hidden">
                          <div 
                              className="h-full bg-red-500 rounded-full" 
                              style={{ width: `${weeklyStats.fat.percent}%` }}
                          />
                      </div>
                  </div>
              </div>

          </div>
        </>
      )}

      {/* Weekly Weight Average Comparison */}
      <Card title="Weekly Weight Average">
          <div className="flex items-center justify-between">
              <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {weightStats.currentAvg > 0 ? weightStats.currentAvg.toFixed(1) : '--'}
                      <span className="text-lg text-gray-500 font-medium ml-1">kg</span>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                      {weightStats.lastAvg > 0 ? (
                          <>
                            vs {weightStats.lastAvg.toFixed(1)}kg last week
                          </>
                      ) : (
                          <span className="text-gray-500 italic">No data last week</span>
                      )}
                  </div>
              </div>

              {/* Indicator Arrow */}
              {weightStats.currentAvg > 0 && weightStats.lastAvg > 0 && (
                  <div className={`p-3 rounded-2xl flex items-center justify-center ${
                      weightStats.diff < 0 
                        ? 'bg-neon-400/10 text-neon-600 dark:text-neon-400' // Lost weight (Good)
                        : weightStats.diff > 0 
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400' // Gained weight (Bad)
                            : 'bg-gray-200 dark:bg-dark-700/50 text-gray-500 dark:text-gray-400' // Same
                  }`}>
                      {weightStats.diff < 0 ? (
                          <TrendingDown size={32} />
                      ) : weightStats.diff > 0 ? (
                          <TrendingUp size={32} />
                      ) : (
                          <Minus size={32} />
                      )}
                  </div>
              )}
          </div>
      </Card>

      {/* Weight Progress Chart */}
      <Card title="Weight Progress">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedLogs}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="date" 
                stroke={axisColor}
                tick={{fill: axisColor, fontSize: 12}}
                tickFormatter={(val) => val.slice(5)} // Show MM-DD
              />
              <YAxis 
                stroke={axisColor}
                tick={{fill: axisColor, fontSize: 12}} 
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px' }}
                itemStyle={{ color: tooltipText }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#a3e635" 
                strokeWidth={3}
                dot={{ fill: '#a3e635', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};