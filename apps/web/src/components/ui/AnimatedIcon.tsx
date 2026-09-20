import { cn } from '@/lib/cn';

type AnimationType = 'none' | 'bounce' | 'pulse' | 'wiggle' | 'float' | 'spin';

interface AnimatedIconProps {
  children: React.ReactNode;
  animation?: AnimationType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const animationStyles: Record<AnimationType, string> = {
  none: '',
  bounce: 'animate-bounce-subtle',
  pulse: 'animate-pulse-soft',
  wiggle: 'animate-wiggle',
  float: 'animate-float',
  spin: 'animate-spin',
};

export default function AnimatedIcon({ children, animation = 'none', size = 'md', className }: AnimatedIconProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-sm',
        sizeStyles[size],
        animationStyles[animation],
        className
      )}
    >
      {children}
    </div>
  );
}
