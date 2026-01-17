import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-dark-800 rounded-2xl p-5 border border-dark-700 shadow-xl ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};