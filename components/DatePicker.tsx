import React, { useState } from 'react';
import { Calendar } from './Calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from './Input';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label: string;
  error?: string;
  existingDates?: Set<string>;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, error, existingDates }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to format display date (e.g. "Sep 25, 2024")
  const getDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    // Use UTC methods to avoid timezone shift for display since we store YYYY-MM-DD literal
    const d = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <>
      <div className="relative cursor-pointer group" onClick={() => setIsOpen(true)}>
        <Input
          label={label}
          value={value} // Keep the raw YYYY-MM-DD in value for the input, standard practice
          onChange={() => {}} // ReadOnly
          error={error}
          readOnly
          className="cursor-pointer pointer-events-none group-hover:border-gray-500 transition-colors"
        />
        <div className="absolute right-3 top-[34px] text-gray-400 group-hover:text-neon-400 transition-colors pointer-events-none">
            <CalendarIcon size={20} />
        </div>
        {/* Transparent overlay for click capturing */}
        <div className="absolute inset-0 top-6 z-10" /> 
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xs">
            <Calendar 
              selectedDate={value} 
              onSelect={(date) => {
                onChange(date);
                setIsOpen(false);
              }}
              existingDates={existingDates}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};