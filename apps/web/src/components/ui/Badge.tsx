import { cn } from '@/lib/cn';
import { CheckCircle, AlertTriangle, XCircle, Info, Tag } from 'lucide-react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'accent';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  accent: 'bg-brand-accent/10 text-brand-accent',
};

const iconMap: Record<BadgeVariant, React.ComponentType<{ className?: string }>> = {
  default: Tag,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  accent: Info,
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
};

export default function Badge({ variant = 'default', size = 'sm', icon = false, className, children }: BadgeProps) {
  const IconComponent = iconMap[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-sm',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && <IconComponent className="flex-shrink-0" />}
      {children}
    </span>
  );
}
