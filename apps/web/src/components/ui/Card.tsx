import { cn } from '@/lib/cn';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'interactive';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  elevated: 'bg-[rgb(var(--bg-primary))] shadow-md',
  outlined: 'bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))]',
  filled: 'bg-[rgb(var(--bg-secondary))]',
  interactive: 'bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] hover:border-brand-accent/30 hover:shadow-lg transition-all duration-200 cursor-pointer',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export default function Card({ variant = 'elevated', padding = 'md', className, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-sm',
        variantStyles[variant],
        paddingStyles[padding],
        onClick && 'active:scale-[0.98] transition-transform duration-150',
        className
      )}
    >
      {children}
    </div>
  );
}
