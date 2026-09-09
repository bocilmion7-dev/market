import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[rgb(var(--text-primary))]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 px-3 text-sm',
            'bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))]',
            'text-[rgb(var(--text-primary))]',
            'placeholder:text-[rgb(var(--text-muted))]',
            'focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-semantic-error focus:ring-semantic-error',
            className
          )}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn('text-xs', error ? 'text-semantic-error' : 'text-[rgb(var(--text-muted))]')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
