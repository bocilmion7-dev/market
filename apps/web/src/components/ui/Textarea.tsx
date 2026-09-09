import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-[rgb(var(--text-primary))]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 text-sm min-h-[80px] resize-y',
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

Textarea.displayName = 'Textarea';

export default Textarea;
