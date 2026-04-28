interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'slate' | 'teal' | 'blue';
  size?: 'sm' | 'md';
}

const variantClasses = {
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  slate: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'slate', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}
