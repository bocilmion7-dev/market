import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-accent text-white hover:bg-brand-accent-dark active:bg-brand-accent-dark',
  secondary: 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--border))]',
  ghost: 'bg-transparent text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]',
  destructive: 'bg-semantic-error text-white hover:bg-red-600',
  outline: 'border border-[rgb(var(--border))] bg-transparent hover:bg-[rgb(var(--bg-tertiary))]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded font-medium',
          'active:scale-[0.98] transition-all duration-100',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
