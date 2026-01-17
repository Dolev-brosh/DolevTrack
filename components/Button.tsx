import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyle = "px-4 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    // Changed text-dark-900 to text-black to ensure contrast in both modes (since dark-900 maps to light in light mode)
    primary: "bg-neon-400 text-black hover:bg-neon-500 shadow-lg shadow-neon-400/20",
    secondary: "bg-dark-700 text-white hover:bg-dark-600 border border-dark-600",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/50 hover:bg-red-500/20",
    outline: "border-2 border-neon-400/50 text-neon-400 hover:bg-neon-400/10"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};