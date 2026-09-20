import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'rounded';
}

export default function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        variant === 'circular' && 'rounded-full',
        variant === 'rounded' && 'rounded-sm',
        className
      )}
      aria-hidden="true"
    />
  );
}
