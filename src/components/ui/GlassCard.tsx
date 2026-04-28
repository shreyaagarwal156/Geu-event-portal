import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
        ${hover ? 'hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
