
import React from 'react';
import { sounds } from '../services/sound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'gold';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  onClick,
  ...props 
}) => {
  const baseStyle = "relative font-bold py-4 px-6 rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-to-br from-red-600 to-red-900 text-white shadow-red-900/40 border border-red-500/30",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-700 shadow-zinc-900/50 border border-zinc-700",
    danger: "bg-gradient-to-br from-red-900 to-black text-red-200 border border-red-800",
    outline: "border-2 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white bg-transparent",
    gold: "bg-gradient-to-br from-yellow-400 to-yellow-700 text-black shadow-yellow-900/40 border border-yellow-300/50"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!props.disabled) {
        sounds.vibrateClick();
    }
    if (onClick) onClick(e);
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};
