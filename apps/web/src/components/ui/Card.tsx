import { cn } from '@/lib/cn';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  variant?: CardVariant;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  elevated: 'bg-[rgb(var(--bg-primary))] shadow-md',
  outlined: 'bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))]',
  filled: 'bg-[rgb(var(--bg-secondary))]',
};

const paddingStyles = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export default function Card({ variant = 'elevated', padding = 'md', className, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg',
        variantStyles[variant],
        paddingStyles[padding],
        onClick && 'cursor-pointer hover:shadow-lg transition-shadow duration-150',
        className
      )}
    >
      {children}
    </div>
  );
}
