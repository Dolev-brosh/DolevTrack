import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  existingDates?: Set<string>;
  onClose: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelect, existingDates, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // If selectedDate is invalid or empty, default to today
    const d = selectedDate ? new Date(selectedDate) : new Date();
    // Validate date (handle potential invalid string)
    if (isNaN(d.getTime())) return new Date();
    // Set to first of month to avoid overflow issues when navigating
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    onSelect(dateStr);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const [y, m, d] = selectedDate.split('-').map(Number);
    return y === currentMonth.getFullYear() && m === (currentMonth.getMonth() + 1) && d === day;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentMonth.getMonth() && 
           today.getFullYear() === currentMonth.getFullYear();
  };

  const hasData = (day: number) => {
    if (!existingDates) return false;
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return existingDates.has(`${year}-${month}-${dayStr}`);
  };

  const renderDays = () => {
    const days = [];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Headers
    dayNames.forEach(d => {
      days.push(
        <div key={d} className="h-10 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
          {d}
        </div>
      );
    });

    // Empty spaces
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const selected = isSelected(d);
      const today = isToday(d);
      const data = hasData(d);

      days.push(
        <button
          key={d}
          onClick={() => handleDayClick(d)}
          type="button"
          className={`
            h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative
            ${selected 
              ? 'bg-neon-400 text-black font-bold shadow-lg shadow-neon-400/30' 
              : 'text-gray-200 hover:bg-dark-700'
            }
            ${!selected && today ? 'border-2 border-neon-400/50 text-neon-400' : ''}
          `}
        >
          {d}
          {/* Dot for existing data */}
          {!selected && data && (
             <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-blue-500"></div>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-dark-800 p-4 rounded-2xl shadow-2xl border border-dark-700 w-full max-w-sm animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} type="button" className="p-2 hover:bg-dark-700 rounded-xl text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="font-bold text-white text-lg">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={nextMonth} type="button" className="p-2 hover:bg-dark-700 rounded-xl text-gray-400 hover:text-white transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 justify-items-center">
        {renderDays()}
      </div>
      
      {/* Cancel Button */}
      <button onClick={onClose} type="button" className="mt-4 w-full py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-700 rounded-xl transition-colors">
        Cancel
      </button>
    </div>
  );
};