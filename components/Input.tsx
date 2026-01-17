import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  // Check if a text color class is provided in className, otherwise default to text-white (which maps to black in light mode)
  const hasTextColor = className.includes('text-');
  const textColorClass = hasTextColor ? '' : 'text-white';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
        {label}
      </label>
      <input
        className={`w-full bg-dark-900 border rounded-xl px-4 py-3 focus:outline-none transition-colors text-lg placeholder-gray-400 dark:[color-scheme:dark] [color-scheme:light] ${textColorClass} ${
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
            : 'border-dark-700 focus:border-neon-400 focus:ring-1 focus:ring-neon-400'
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-red-600 dark:text-red-400 text-xs font-bold mt-1 ml-1">{error}</span>
      )}
    </div>
  );
};