# Mobile Responsive & Professional UX Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the frontend to be fully mobile responsive and professional-quality with a design system, shared component library, mobile navigation, and consistent UX patterns.

**Architecture:** Critical Path Hybrid — build design tokens + core components first, upgrade storefront pages (highest revenue impact), then admin panel. Use CSS variables for dark mode, Tailwind for styling, and Zustand for UI state (toasts, drawers).

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3, Zustand, React Router v6

---

## File Structure

```
apps/web/src/
├── styles/
│   └── globals.css              # CSS variables, dark mode, animations
├── components/
│   ├── ui/                      # NEW: Shared component library
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   └── EmptyState.tsx
│   ├── layout/
│   │   ├── StorefrontLayout.tsx # MODIFY: Add bottom tab bar, dark mode
│   │   ├── AdminLayout.tsx      # MODIFY: Add drawer, mobile cards
│   │   ├── PublisherLayout.tsx  # MODIFY: Add drawer, mobile cards
│   │   ├── BottomTabBar.tsx     # NEW: Mobile bottom navigation
│   │   ├── MobileDrawer.tsx     # NEW: Slide-in drawer for admin
│   │   └── TopBar.tsx           # NEW: Mobile top bar with hamburger
│   ├── MobileNav.tsx            # REMOVE: Replace with BottomTabBar
│   ├── NotificationBell.tsx     # MODIFY: Use new components
│   └── DarkModeToggle.tsx       # NEW: Theme switcher
├── stores/
│   └── ui.ts                    # NEW: UI state (drawer, toasts, theme)
├── hooks/
│   ├── useMediaQuery.ts         # NEW: Responsive breakpoint hook
│   └── useScrollDirection.ts    # NEW: Hide/show bottom bar
├── routes/
│   ├── storefront/
│   │   ├── Home.tsx             # MODIFY: Responsive layout
│   │   ├── ProductList.tsx      # MODIFY: Responsive grid, filters
│   │   ├── ProductDetail.tsx    # MODIFY: Sticky cart, carousel
│   │   ├── Cart.tsx             # MODIFY: Sticky total, swipe remove
│   │   └── Checkout.tsx         # MODIFY: Stacked mobile layout
│   ├── admin/
│   │   ├── Dashboard.tsx        # MODIFY: Card grid, responsive stats
│   │   └── Users.tsx            # MODIFY: Table → cards on mobile
│   └── auth/
│       └── Login.tsx            # MODIFY: Use new Input/Button
└── lib/
    └── cn.ts                    # NEW: clsx + tailwind-merge utility
```

---

## Task 1: Design System Foundation

**Files:**
- Modify: `apps/web/tailwind.config.ts`
- Modify: `apps/web/src/styles/globals.css`
- Create: `apps/web/src/lib/cn.ts`

- [ ] **Step 1: Update tailwind.config.ts with design tokens**

```typescript
// apps/web/tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          dark: '#1a1a1a',
          gray: '#333333',
          surface: '#ffffff',
          muted: '#f5f5f5',
          accent: '#f97316',
          'accent-dark': '#ea580c',
        },
        semantic: {
          success: '#22c55e',
          error: '#ef4444',
          warning: '#eab308',
          info: '#3b82f6',
        },
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'slide-in-top': 'slideInTop 300ms ease-out',
        'slide-in-left': 'slideInLeft 250ms ease-out',
        'slide-in-bottom': 'slideInBottom 250ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
        'scale-down': 'scaleDown 100ms ease',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInTop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleDown: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.98)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Update globals.css with CSS variables and dark mode**

```css
/* apps/web/src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: 255 255 255;
    --bg-secondary: 245 245 245;
    --bg-tertiary: 229 229 229;
    --text-primary: 10 10 10;
    --text-secondary: 82 82 82;
    --text-muted: 115 115 115;
    --border: 229 229 229;
  }

  .dark {
    --bg-primary: 15 15 15;
    --bg-secondary: 26 26 26;
    --bg-tertiary: 38 38 38;
    --text-primary: 250 250 250;
    --text-secondary: 163 163 163;
    --text-muted: 115 115 115;
    --border: 38 38 38;
  }

  body {
    @apply bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))];
    @apply min-h-[100dvh];
    -webkit-tap-highlight-color: transparent;
  }

  * {
    @apply transition-colors duration-150;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      @apply !transition-none;
      animation: none !important;
    }
  }
}

@layer components {
  .skeleton {
    @apply bg-gradient-to-r from-[rgb(var(--bg-tertiary))] via-[rgb(var(--bg-secondary))] to-[rgb(var(--bg-tertiary))];
    background-size: 200% 100%;
    @apply animate-shimmer;
  }

  .touch-target {
    @apply min-h-[44px] min-w-[44px];
  }
}
```

- [ ] **Step 3: Create cn utility**

```typescript
// apps/web/src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Install dependencies**

Run: `cd /root/marketplace/apps/web && npm install clsx tailwind-merge`

- [ ] **Step 5: Commit**

```bash
cd /root/marketplace && git add apps/web/tailwind.config.ts apps/web/src/styles/globals.css apps/web/src/lib/cn.ts apps/web/package.json apps/web/package-lock.json && git commit -m "feat: add design tokens, dark mode support, and cn utility"
```

---

## Task 2: Core Components — Button

**Files:**
- Create: `apps/web/src/components/ui/Button.tsx`

- [ ] **Step 1: Create Button component skeleton**

```typescript
// apps/web/src/components/ui/Button.tsx
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
```

- [ ] **Step 2: Commit**

```bash
cd /root/marketplace && git add apps/web/src/components/ui/Button.tsx && git commit -m "feat: add Button component with variants, sizes, and loading state"
```

---

## Task 3: Core Components — Input, Select, Textarea

**Files:**
- Create: `apps/web/src/components/ui/Input.tsx`
- Create: `apps/web/src/components/ui/Select.tsx`
- Create: `apps/web/src/components/ui/Textarea.tsx`

- [ ] **Step 1: Create Input component**

```typescript
// apps/web/src/components/ui/Input.tsx
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
            'w-full h-10 px-3 rounded text-sm',
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
```

- [ ] **Step 2: Create Select component**

```typescript
// apps/web/src/components/ui/Select.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[rgb(var(--text-primary))]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full h-10 px-3 rounded text-sm appearance-none',
            'bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))]',
            'text-[rgb(var(--text-primary))]',
            'focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-semantic-error focus:ring-semantic-error',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-semantic-error">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
```

- [ ] **Step 3: Create Textarea component**

```typescript
// apps/web/src/components/ui/Textarea.tsx
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
            'w-full px-3 py-2 rounded text-sm min-h-[80px] resize-y',
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
```

- [ ] **Step 4: Commit**

```bash
cd /root/marketplace && git add apps/web/src/components/ui/Input.tsx apps/web/src/components/ui/Select.tsx apps/web/src/components/ui/Textarea.tsx && git commit -m "feat: add Input, Select, and Textarea components with labels and validation"
```

---

## Task 4: Core Components — Card, Badge, Skeleton

**Files:**
- Create: `apps/web/src/components/ui/Card.tsx`
- Create: `apps/web/src/components/ui/Badge.tsx`
- Create: `apps/web/src/components/ui/Skeleton.tsx`

- [ ] **Step 1: Create Card component**

```typescript
// apps/web/src/components/ui/Card.tsx
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
```

- [ ] **Step 2: Create Badge component**

```typescript
// apps/web/src/components/ui/Badge.tsx
import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'accent';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
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

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export default function Badge({ variant = 'default', size = 'sm', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Create Skeleton component**

```typescript
// apps/web/src/components/ui/Skeleton.tsx
import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton rounded',
        className
      )}
    />
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /root/marketplace && git add apps/web/src/components/ui/Card.tsx apps/web/src/components/ui/Badge.tsx apps/web/src/components/ui/Skeleton.tsx && git commit -m "feat: add Card, Badge, and Skeleton components"
```

---

## Task 5: Core Components — Modal, Toast, EmptyState

**Files:**
- Create: `apps/web/src/components/ui/Modal.tsx`
- Create: `apps/web/src/components/ui/Toast.tsx`
- Create: `apps/web/src/components/ui/EmptyState.tsx`
- Create: `apps/web/src/stores/ui.ts`

- [ ] **Step 1: Create UI store for toasts and drawers**

```typescript
// apps/web/src/stores/ui.ts
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  drawerOpen: boolean;
  toasts: Toast[];
  theme: 'light' | 'dark' | 'system';
  setDrawerOpen: (open: boolean) => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>((set) => ({
  drawerOpen: false,
  toasts: [],
  theme: 'system',
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  addToast: (message, type) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    if (type !== 'error') {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, 5000);
    }
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
}));
```

- [ ] **Step 2: Create Modal component**

```typescript
// apps/web/src/components/ui/Modal.tsx
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full sm:max-w-md bg-[rgb(var(--bg-primary))] rounded-t-xl sm:rounded-xl',
          'max-h-[85vh] overflow-y-auto animate-slide-in-bottom sm:animate-fade-in',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg touch-target">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Toast component**

```typescript
// apps/web/src/components/ui/Toast.tsx
import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/cn';

const typeStyles = {
  success: 'bg-semantic-success text-white',
  error: 'bg-semantic-error text-white',
  info: 'bg-semantic-info text-white',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center justify-between p-3 rounded-lg shadow-lg animate-slide-in-right',
            typeStyles[toast.type]
          )}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-3 p-1 hover:opacity-80 touch-target"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create EmptyState component**

```typescript
// apps/web/src/components/ui/EmptyState.tsx
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 mb-4 text-[rgb(var(--text-muted))]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[rgb(var(--text-secondary))] mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="primary" size="md">
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
cd /root/marketplace && git add apps/web/src/stores/ui.ts apps/web/src/components/ui/Modal.tsx apps/web/src/components/ui/Toast.tsx apps/web/src/components/ui/EmptyState.tsx && git commit -m "feat: add Modal, Toast, EmptyState components and UI store"
```

---

## Task 6: Core Components — Barrel Export

**Files:**
- Create: `apps/web/src/components/ui/index.ts`

- [ ] **Step 1: Create barrel export file**

```typescript
// apps/web/src/components/ui/index.ts
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Textarea } from './Textarea';
export { default as Card } from './Card';
export { default as Badge } from './Badge';
export { default as Modal } from './Modal';
export { default as Toast } from './Toast';
export { default as Skeleton } from './Skeleton';
export { default as EmptyState } from './EmptyState';
```

- [ ] **Step 2: Commit**

```bash
cd /root/marketplace && git add apps/web/src/components/ui/index.ts && git commit -m "feat: add UI component barrel export"
```

---

## Task 7: Hooks — useMediaQuery, useScrollDirection

**Files:**
- Create: `apps/web/src/hooks/useMediaQuery.ts`
- Create: `apps/web/src/hooks/useScrollDirection.ts`

- [ ] **Step 1: Create useMediaQuery hook**

```typescript
// apps/web/src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query, matches]);

  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 769px)');
```

- [ ] **Step 2: Create useScrollDirection hook**

```typescript
// apps/web/src/hooks/useScrollDirection.ts
import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [prevOffset, setPrevOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.scrollY;
      const direction = currentOffset > prevOffset ? 'down' : 'up';
      if (currentOffset !== prevOffset) {
        setScrollDirection(direction);
      }
      setPrevOffset(currentOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevOffset]);

  return scrollDirection;
}
```

- [ ] **Step 3: Commit**

```bash
cd /root/marketplace && git add apps/web/src/hooks/useMediaQuery.ts apps/web/src/hooks/useScrollDirection.ts && git commit -m "feat: add useMediaQuery and useScrollDirection hooks"
```

---

## Task 8: Bottom Tab Bar Navigation

**Files:**
- Create: `apps/web/src/components/layout/BottomTabBar.tsx`
- Create: `apps/web/src/components/layout/TopBar.tsx`

- [ ] **Step 1: Create BottomTabBar component**

```typescript
// apps/web/src/components/layout/BottomTabBar.tsx
import { Link, useLocation } from 'react-router-dom';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/cn';

const tabs = [
  { path: '/', label: 'Home', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { path: '/products', label: 'Search', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )},
  { path: '/cart', label: 'Cart', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )},
  { path: '/account', label: 'Account', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
];

export default function BottomTabBar() {
  const location = useLocation();
  const scrollDirection = useScrollDirection();
  const isHidden = scrollDirection === 'down' && window.scrollY > 100;

  return (
    <nav
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-40',
        'bg-[rgb(var(--bg-primary))] border-t border-[rgb(var(--border))]',
        'transition-transform duration-300',
        isHidden ? 'translate-y-full' : 'translate-y-0'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = tab.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full touch-target',
                isActive ? 'text-brand-accent' : 'text-[rgb(var(--text-muted))]'
              )}
            >
              {tab.icon(isActive)}
              <span className="text-xs mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create TopBar component**

```typescript
// apps/web/src/components/layout/TopBar.tsx
import { Link } from 'react-router-dom';
import { useUIStore } from '@/stores/ui';
import NotificationBell from '@/components/NotificationBell';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useAuthStore } from '@/stores/auth';

export default function TopBar() {
  const setDrawerOpen = useUIStore((s) => s.setDrawerOpen);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border))]">
      <div className="flex items-center justify-between h-14 px-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -ml-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg touch-target"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/" className="text-lg font-bold">Marketplace</Link>

        <div className="flex items-center gap-1">
          <DarkModeToggle />
          {user && <NotificationBell />}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /root/marketplace && git add apps/web/src/components/layout/BottomTabBar.tsx apps/web/src/components/layout/TopBar.tsx && git commit -m "feat: add BottomTabBar and TopBar mobile navigation components"
```

---

## Task 9: Dark Mode Toggle

**Files:**
- Create: `apps/web/src/components/DarkModeToggle.tsx`

- [ ] **Step 1: Create DarkModeToggle component**

```typescript
// apps/web/src/components/DarkModeToggle.tsx
import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/cn';

export default function DarkModeToggle() {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const applyTheme = (t: string) => {
      if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme, setTheme]);

  const toggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggle}
      className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg touch-target"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/marketplace && git add apps/web/src/components/DarkModeToggle.tsx && git commit -m "feat: add DarkModeToggle component with system preference detection"
```

---

## Task 10: Mobile Drawer Navigation

**Files:**
- Create: `apps/web/src/components/layout/MobileDrawer.tsx`

- [ ] **Step 1: Create MobileDrawer component**

```typescript
// apps/web/src/components/layout/MobileDrawer.tsx
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/cn';

interface DrawerLink {
  label: string;
  path: string;
}

interface MobileDrawerProps {
  links: DrawerLink[];
  title: string;
}

export default function MobileDrawer({ links, title }: MobileDrawerProps) {
  const { drawerOpen, setDrawerOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 100) {
      setDrawerOpen(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'md:hidden fixed top-0 left-0 bottom-0 z-50 w-72',
          'bg-[rgb(var(--bg-primary))] shadow-xl',
          'transition-transform duration-250 ease-out',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 -mr-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setDrawerOpen(false)}
              className={cn(
                'block px-3 py-2.5 rounded-lg text-sm transition-colors touch-target',
                location.pathname === link.path
                  ? 'bg-brand-accent text-white'
                  : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgb(var(--border))]">
            <p className="text-sm text-[rgb(var(--text-muted))] mb-2">{user.email}</p>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                setDrawerOpen(false);
              }}
              className="text-sm text-semantic-error hover:text-red-600 touch-target"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/marketplace && git add apps/web/src/components/layout/MobileDrawer.tsx && git commit -m "feat: add MobileDrawer component with swipe-to-close gesture"
```

---

## Task 11: Update StorefrontLayout

**Files:**
- Modify: `apps/web/src/components/layout/StorefrontLayout.tsx`

- [ ] **Step 1: Update StorefrontLayout with new components**

```typescript
// apps/web/src/components/layout/StorefrontLayout.tsx
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useIsMobile } from '@/hooks/useMediaQuery';
import BottomTabBar from './BottomTabBar';
import TopBar from './TopBar';
import MobileDrawer from './MobileDrawer';
import DarkModeToggle from '@/components/DarkModeToggle';
import NotificationBell from '@/components/NotificationBell';

const secondaryLinks = [
  { label: 'Products', path: '/products' },
  { label: 'My Orders', path: '/orders' },
  { label: 'Wishlist', path: '/wishlist' },
];

export default function StorefrontLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const isMobile = useIsMobile();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-[100dvh] bg-[rgb(var(--bg-secondary))]">
      {isMobile ? (
        <>
          <TopBar />
          <MobileDrawer links={secondaryLinks} title="Menu" />
        </>
      ) : (
        <header className="bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border))] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-xl font-bold">Marketplace</Link>

              <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </form>

              <div className="flex items-center gap-4">
                <Link to="/products" className="text-sm hover:text-brand-accent">Products</Link>
                <Link to="/cart" className="text-sm hover:text-brand-accent">Cart</Link>
                <DarkModeToggle />
                {user ? (
                  <>
                    <NotificationBell />
                    {user.roles?.includes('ADMIN_MAKER') && <Link to="/admin" className="text-sm hover:text-brand-accent">Admin</Link>}
                    {user.roles?.includes('PRODUCT_PUBLISHER') && <Link to="/publisher" className="text-sm hover:text-brand-accent">Publisher</Link>}
                    <button onClick={() => useAuthStore.getState().logout()} className="text-sm text-semantic-error hover:text-red-600">Logout</button>
                  </>
                ) : (
                  <Link to="/login" className="text-sm hover:text-brand-accent">Login</Link>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={isMobile ? 'pb-20' : ''}>
        <Outlet />
      </main>

      {!isMobile && (
        <footer className="bg-[rgb(var(--bg-primary))] border-t border-[rgb(var(--border))] mt-12 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[rgb(var(--text-muted))]">
            <p>Marketplace — Multi-Publisher Platform</p>
          </div>
        </footer>
      )}

      {isMobile && <BottomTabBar />}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/marketplace && git add apps/web/src/components/layout/StorefrontLayout.tsx && git commit -m "feat: update StorefrontLayout with mobile navigation and dark mode"
```

---

## Task 12: Update AdminLayout and PublisherLayout

**Files:**
- Modify: `apps/web/src/components/layout/AdminLayout.tsx`
- Modify: `apps/web/src/components/layout/PublisherLayout.tsx`

- [ ] **Step 1: Update AdminLayout with drawer navigation**

```typescript
// apps/web/src/components/layout/AdminLayout.tsx
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useLogout } from '@/features/auth/hooks';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useUIStore } from '@/stores/ui';
import MobileDrawer from './MobileDrawer';
import DarkModeToggle from '@/components/DarkModeToggle';

const navItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Brands', path: '/admin/brands' },
  { label: 'Settings', path: '/admin/settings' },
  { label: 'Form Builder', path: '/admin/form-builder' },
  { label: 'Approvals', path: '/admin/approvals' },
  { label: 'Reports', path: '/admin/reports' },
  { label: 'Audit Logs', path: '/admin/audit-logs' },
];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const location = useLocation();
  const isMobile = useIsMobile();
  const setDrawerOpen = useUIStore((s) => s.setDrawerOpen);

  if (isMobile) {
    return (
      <div className="min-h-[100dvh] bg-[rgb(var(--bg-secondary))]">
        <MobileDrawer links={navItems} title="Admin" />
        
        <header className="sticky top-0 z-30 bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border))]">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 -ml-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg touch-target"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">Admin</h1>
            <DarkModeToggle />
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-[rgb(var(--bg-primary))] border-r border-[rgb(var(--border))] text-[rgb(var(--text-primary))] flex flex-col">
        <div className="p-4 border-b border-[rgb(var(--border))]">
          <h1 className="text-lg font-bold">Marketplace Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-brand-accent text-white'
                  : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[rgb(var(--border))]">
          <p className="text-xs text-[rgb(var(--text-muted))] mb-2">{user?.email}</p>
          <button
            onClick={() => logout.mutate()}
            className="text-sm text-semantic-error hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-[rgb(var(--bg-secondary))] overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Update PublisherLayout with drawer navigation**

```typescript
// apps/web/src/components/layout/PublisherLayout.tsx
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useLogout } from '@/features/auth/hooks';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useUIStore } from '@/stores/ui';
import MobileDrawer from './MobileDrawer';
import DarkModeToggle from '@/components/DarkModeToggle';

const navItems = [
  { label: 'Dashboard', path: '/publisher' },
  { label: 'My Products', path: '/publisher/products' },
  { label: 'Orders', path: '/publisher/orders' },
];

export default function PublisherLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const location = useLocation();
  const isMobile = useIsMobile();
  const setDrawerOpen = useUIStore((s) => s.setDrawerOpen);

  if (isMobile) {
    return (
      <div className="min-h-[100dvh] bg-[rgb(var(--bg-secondary))]">
        <MobileDrawer links={navItems} title="Publisher" />
        
        <header className="sticky top-0 z-30 bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border))]">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 -ml-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg touch-target"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">Publisher</h1>
            <DarkModeToggle />
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-[rgb(var(--bg-primary))] border-r border-[rgb(var(--border))] text-[rgb(var(--text-primary))] flex flex-col">
        <div className="p-4 border-b border-[rgb(var(--border))]">
          <h1 className="text-lg font-bold">Publisher Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === item.path || (item.path !== '/publisher' && location.pathname.startsWith(item.path))
                  ? 'bg-brand-accent text-white'
                  : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[rgb(var(--border))]">
          <p className="text-xs text-[rgb(var(--text-muted))] mb-2">{user?.email}</p>
          <button onClick={() => logout.mutate()} className="text-sm text-semantic-error hover:text-red-600">Logout</button>
        </div>
      </aside>
      <main className="flex-1 bg-[rgb(var(--bg-secondary))] overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /root/marketplace && git add apps/web/src/components/layout/AdminLayout.tsx apps/web/src/components/layout/PublisherLayout.tsx && git commit -m "feat: update AdminLayout and PublisherLayout with mobile drawer navigation"
```

---

## Task 13: Update Storefront Pages — Home

**Files:**
- Modify: `apps/web/src/routes/storefront/Home.tsx`

- [ ] **Step 1: Update Home page with responsive design**

```typescript
// apps/web/src/routes/storefront/Home.tsx
import { Link } from 'react-router-dom';
import { useHomepage } from '@/features/storefront/hooks';
import SEOHead from '@/components/SEOHead';
import { Skeleton } from '@/components/ui';

export default function Home() {
  const { data, isLoading } = useHomepage();

  return (
    <div>
      <SEOHead title="Home" description="Discover products from multiple publishers at great prices" />
      
      <section className="bg-gradient-to-r from-brand-dark to-brand-accent text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Marketplace</h1>
          <p className="text-lg mb-8 text-gray-200">Discover products from multiple publishers</p>
          <Link
            to="/products"
            className="inline-block bg-white text-brand-dark px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 active:scale-[0.98] transition-all"
          >
            Browse Products
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))
          ) : (
            data?.categories?.map((cat: any) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="bg-[rgb(var(--bg-primary))] rounded-lg p-4 text-center hover:shadow-md transition-shadow touch-target"
              >
                <p className="font-medium text-sm md:text-base">{cat.name}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Latest Products</h2>
          <Link to="/products" className="text-brand-accent hover:underline text-sm md:text-base">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-40 md:h-48 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            data?.featuredProducts?.map((product: any) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="bg-[rgb(var(--bg-primary))] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-32 md:h-48 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center">
                  {product.media?.[0]?.url ? (
                    <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <p className="text-xs text-[rgb(var(--text-muted))]">{product.category?.name}</p>
                  <p className="font-medium truncate text-sm md:text-base">{product.name}</p>
                  <p className="text-brand-accent font-bold mt-1 text-sm md:text-base">
                    Rp {Number(product.marketplacePrice).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/marketplace && git add apps/web/src/routes/storefront/Home.tsx && git commit -m "feat: update Home page with responsive design and skeletons"
```

---

## Task 14: Update Storefront Pages — ProductList, ProductDetail

**Files:**
- Modify: `apps/web/src/routes/storefront/ProductList.tsx`
- Modify: `apps/web/src/routes/storefront/ProductDetail.tsx`

- [ ] **Step 1: Update ProductList with responsive design**

```typescript
// apps/web/src/routes/storefront/ProductList.tsx
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStoreProducts, useStoreCategories } from '@/features/storefront/hooks';
import SEOHead from '@/components/SEOHead';
import { Skeleton, EmptyState, Badge } from '@/components/ui';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('newest');
  const isMobile = useIsMobile();

  const categoryId = searchParams.get('categoryId') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useStoreProducts({ page, categoryId, search, sort });
  const { data: categories } = useStoreCategories();

  const handleCategoryClick = (id: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (id) params.set('categoryId', id);
    else params.delete('categoryId');
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <SEOHead title="Products" description="Browse our collection of products" />
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {!isMobile && (
          <aside className="w-64 flex-shrink-0">
            <h3 className="font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`text-sm ${!categoryId ? 'text-brand-accent font-medium' : 'text-[rgb(var(--text-secondary))] hover:text-brand-accent'}`}
                >
                  All Products
                </button>
              </li>
              {categories?.map((cat: any) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`text-sm ${categoryId === cat.id ? 'text-brand-accent font-medium' : 'text-[rgb(var(--text-secondary))] hover:text-brand-accent'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-bold">
              {search ? `Results for "${search}"` : 'All Products'}
            </h1>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full sm:w-auto border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-sm bg-[rgb(var(--bg-primary))]"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          {isMobile && (
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm ${!categoryId ? 'bg-brand-accent text-white' : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]'}`}
              >
                All
              </button>
              {categories?.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm ${categoryId === cat.id ? 'bg-brand-accent text-white' : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-40 md:h-48 rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : data?.products?.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  title={search ? `No products match "${search}"` : "No products found"}
                  description="Try adjusting your filters or search terms"
                  action={search ? { label: "Clear Search", onClick: () => setSearchParams({}) } : undefined}
                />
              </div>
            ) : (
              data?.products?.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="bg-[rgb(var(--bg-primary))] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-32 md:h-48 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center">
                    {product.media?.[0]?.url ? (
                      <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <p className="text-xs text-[rgb(var(--text-muted))]">{product.publisher?.fullName}</p>
                    <p className="font-medium truncate mt-1 text-sm md:text-base">{product.name}</p>
                    <p className="text-brand-accent font-bold mt-1 text-sm md:text-base">
                      Rp {Number(product.marketplacePrice).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(p));
                    setSearchParams(params);
                  }}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-brand-accent text-white'
                      : 'bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-tertiary))]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update ProductDetail with sticky add-to-cart**

```typescript
// apps/web/src/routes/storefront/ProductDetail.tsx
import { useParams, Link } from 'react-router-dom';
import { useProductBySlug } from '@/features/storefront/hooks';
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/features/wishlist/hooks';
import SEOHead from '@/components/SEOHead';
import { Skeleton, Badge, Button } from '@/components/ui';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useState } from 'react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || '');
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const isMobile = useIsMobile();
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <Skeleton className="aspect-square rounded-lg" />
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <p className="text-[rgb(var(--text-muted))] mb-4">This product doesn't exist or was removed.</p>
        <Link to="/products" className="text-brand-accent hover:underline">Browse Products →</Link>
      </div>
    );
  }

  const isWishlisted = Array.isArray(wishlist) && wishlist.some((w: any) => w.productId === product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <SEOHead
        title={product.name}
        description={product.description?.substring(0, 160)}
        image={product.media?.[0]?.url}
      />
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="w-full md:w-1/2">
          <div className="bg-[rgb(var(--bg-primary))] rounded-lg overflow-hidden aspect-square flex items-center justify-center">
            {product.media?.[selectedImage]?.url ? (
              <img src={product.media[selectedImage].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[rgb(var(--text-muted))] text-lg">No Image</span>
            )}
          </div>
          {product.media?.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {product.media.map((m: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                    selectedImage === i ? 'border-brand-accent' : 'border-transparent'
                  }`}
                >
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2">
          <p className="text-sm text-[rgb(var(--text-muted))] mb-2">
            <Link to={`/products?categoryId=${product.category?.id}`} className="hover:text-brand-accent">{product.category?.name}</Link>
            {product.brand && <span> · {product.brand.name}</span>}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl md:text-3xl font-bold text-brand-accent">
              Rp {Number(product.marketplacePrice).toLocaleString()}
            </span>
            {product.bestPrice !== product.marketplacePrice && (
              <span className="text-lg text-[rgb(var(--text-muted))] line-through">
                Rp {Number(product.bestPrice).toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {Array(5).fill(0).map((_, i) => (
                <span key={i} className={i < Math.round(product.avgRating || 0) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
              ))}
              <span className="text-sm text-[rgb(var(--text-muted))] ml-1">({product.reviewCount || 0})</span>
            </div>
          </div>

          <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4 mb-6">
            <p className="text-sm text-[rgb(var(--text-muted))]">Seller</p>
            <p className="font-medium">{product.publisher?.fullName}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-[rgb(var(--text-muted))]">Stock</p>
              <p className={product.stock > 0 ? 'text-semantic-success' : 'text-semantic-error'}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </p>
            </div>
            {product.variants?.length > 0 && (
              <div>
                <p className="text-sm text-[rgb(var(--text-muted))] mb-2">Variants ({product.variants.length})</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <Badge key={v.id} variant="default">
                      {Object.values(v.variantFormData).join(' / ')} — Rp {Number(v.marketplacePrice).toLocaleString()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              disabled={product.stock <= 0}
              className="flex-1"
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button
              variant="outline"
              onClick={() => isWishlisted ? removeFromWishlist.mutate(product.id) : addToWishlist.mutate(product.id)}
            >
              {isWishlisted ? '♥' : '♡'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 md:mt-12">
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <div className="bg-[rgb(var(--bg-primary))] rounded-lg p-4 md:p-6 prose max-w-none text-sm md:text-base">
          {product.description}
        </div>
      </div>

      {product.relatedProducts?.length > 0 && (
        <div className="mt-8 md:mt-12">
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {product.relatedProducts.map((rp: any) => (
              <Link
                key={rp.id}
                to={`/products/${rp.slug}`}
                className="bg-[rgb(var(--bg-primary))] rounded-lg overflow-hidden hover:shadow-md transition-shadow flex-shrink-0 w-40 md:w-auto"
              >
                <div className="h-32 md:h-40 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center">
                  {rp.media?.[0]?.url ? <img src={rp.media[0].url} alt="" className="h-full w-full object-cover" /> : <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{rp.name}</p>
                  <p className="text-brand-accent font-bold text-sm">Rp {Number(rp.marketplacePrice).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isMobile && (
        <div className="fixed bottom-16 left-0 right-0 bg-[rgb(var(--bg-primary))] border-t border-[rgb(var(--border))] p-4 z-30">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-[rgb(var(--text-muted))]">Total</p>
              <p className="text-lg font-bold text-brand-accent">Rp {Number(product.marketplacePrice).toLocaleString()}</p>
            </div>
            <Button disabled={product.stock <= 0} className="flex-1">
              Add to Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /root/marketplace && git add apps/web/src/routes/storefront/ProductList.tsx apps/web/src/routes/storefront/ProductDetail.tsx && git commit -m "feat: update ProductList and ProductDetail with responsive design"
```

---

## Task 15: Update Storefront Pages — Cart, Checkout

**Files:**
- Modify: `apps/web/src/routes/storefront/Cart.tsx`
- Modify: `apps/web/src/routes/storefront/Checkout.tsx`

- [ ] **Step 1: Update Cart with sticky total and empty state**

```typescript
// apps/web/src/routes/storefront/Cart.tsx
import { Link } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '@/features/cart/hooks';
import { useUIStore } from '@/stores/ui';
import { Skeleton, EmptyState, Button } from '@/components/ui';

export default function Cart() {
  const { data: items, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const addToast = useUIStore((s) => s.addToast);

  const total = items?.reduce((sum: number, item: any) => {
    const price = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
    return sum + price * item.quantity;
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6">Shopping Cart</h1>

      {!items || items.length === 0 ? (
        <div className="bg-[rgb(var(--bg-primary))] rounded-lg">
          <EmptyState
            title="Your cart is empty"
            description="Add some products to get started"
            action={{ label: "Browse Products", onClick: () => window.location.href = '/products' }}
          />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item: any) => {
              const price = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
              return (
                <div key={item.id} className="bg-[rgb(var(--bg-primary))] rounded-lg p-4 flex gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[rgb(var(--bg-tertiary))] rounded flex-shrink-0 flex items-center justify-center">
                    {item.product.media?.[0]?.url ? (
                      <img src={item.product.media[0].url} alt="" className="w-full h-full object-cover rounded" />
                    ) : <span className="text-[rgb(var(--text-muted))] text-xs">No img</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product.slug}`} className="font-medium hover:text-brand-accent text-sm md:text-base truncate block">
                      {item.product.name}
                    </Link>
                    {item.variant && <p className="text-xs text-[rgb(var(--text-muted))]">{Object.values(item.variant.variantFormData).join(' / ')}</p>}
                    <p className="text-brand-accent font-bold mt-1 text-sm md:text-base">Rp {price.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity - 1 })}
                        className="w-8 h-8 border border-[rgb(var(--border))] rounded flex items-center justify-center hover:bg-[rgb(var(--bg-tertiary))] touch-target"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        className="w-8 h-8 border border-[rgb(var(--border))] rounded flex items-center justify-center hover:bg-[rgb(var(--bg-tertiary))] touch-target"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">Rp {(price * item.quantity).toLocaleString()}</p>
                      <button
                        onClick={() => {
                          removeItem.mutate(item.id);
                          addToast('Item removed from cart', 'success');
                        }}
                        className="text-semantic-error text-xs mt-1 touch-target"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[rgb(var(--bg-primary))] rounded-lg p-4 md:p-6 mt-6 md:sticky md:top-20">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg">Total</span>
              <span className="text-xl md:text-2xl font-bold text-brand-accent">Rp {total.toLocaleString()}</span>
            </div>
            <Link
              to="/checkout"
              className="block w-full bg-brand-accent text-white text-center py-3 rounded-lg font-semibold hover:bg-brand-accent-dark active:scale-[0.98] transition-all touch-target"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update Checkout with stacked mobile layout**

```typescript
// apps/web/src/routes/storefront/Checkout.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useCreateOrder } from '@/features/cart/hooks';
import { useInitiatePayment } from '@/features/payment/hooks';
import { Button, Input, Textarea } from '@/components/ui';

export default function Checkout() {
  const navigate = useNavigate();
  const { data: items } = useCart();
  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();

  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const total = items?.reduce((sum: number, item: any) => {
    const price = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
    return sum + price * item.quantity;
  }, 0) || 0;

  const handleCheckout = () => {
    if (!shippingAddress) return;
    createOrder.mutate({
      shippingAddressId: shippingAddress,
      shippingService: 'REG',
      shippingCourier: 'jne',
      notes,
    }, {
      onSuccess: (data) => {
        const orderId = data.order.id;
        initiatePayment.mutate(orderId, {
          onSuccess: (paymentData) => {
            window.location.href = paymentData.redirect_url;
          },
        });
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div>
          <h2 className="font-bold mb-4">Shipping Address</h2>
          <Textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your full shipping address..."
            rows={4}
          />

          <h2 className="font-bold mt-6 mb-4">Notes</h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Order notes (optional)..."
            rows={3}
          />
        </div>

        <div>
          <h2 className="font-bold mb-4">Order Summary</h2>
          <div className="bg-[rgb(var(--bg-primary))] rounded-lg p-4 space-y-3">
            {items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="truncate flex-1 mr-2">{item.product.name} × {item.quantity}</span>
                <span className="flex-shrink-0">
                  Rp {((item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice)) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="border-t border-[rgb(var(--border))] pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-brand-accent">Rp {total.toLocaleString()}</span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={!shippingAddress || createOrder.isPending || initiatePayment.isPending}
            loading={createOrder.isPending || initiatePayment.isPending}
            className="w-full mt-4"
          >
            {initiatePayment.isPending ? 'Redirecting to Payment...' : createOrder.isPending ? 'Creating Order...' : 'Place Order & Pay'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /root/marketplace && git add apps/web/src/routes/storefront/Cart.tsx apps/web/src/routes/storefront/Checkout.tsx && git commit -m "feat: update Cart and Checkout with responsive design and better empty states"
```

---

## Task 16: Update Admin Pages — Dashboard, Users

**Files:**
- Modify: `apps/web/src/routes/admin/Dashboard.tsx`
- Modify: `apps/web/src/routes/admin/Users.tsx`

- [ ] **Step 1: Update Dashboard with responsive stat cards**

```typescript
// apps/web/src/routes/admin/Dashboard.tsx
import { useDashboardStats } from '@/features/admin/reportHooks';
import { Skeleton, Card } from '@/components/ui';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, color: 'bg-blue-500' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, color: 'bg-green-500' },
    { label: 'Customers', value: stats?.totalCustomers || 0, color: 'bg-purple-500' },
    { label: 'Publishers', value: stats?.totalPublishers || 0, color: 'bg-orange-500' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, color: 'bg-yellow-500' },
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
        {statCards.map((card) => (
          <Card key={card.label} padding="md">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-1 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            ) : (
              <>
                <div className={`h-1 ${card.color} rounded-full mb-3`} />
                <p className="text-xs md:text-sm text-[rgb(var(--text-muted))]">{card.label}</p>
                <p className="text-xl md:text-2xl font-bold">{card.value}</p>
              </>
            )}
          </Card>
        ))}
      </div>

      <Card padding="lg">
        <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-[rgb(var(--border))]">
              <tr>
                <th className="p-2 text-left text-sm font-medium">Order #</th>
                <th className="p-2 text-left text-sm font-medium">Customer</th>
                <th className="p-2 text-left text-sm font-medium">Amount</th>
                <th className="p-2 text-left text-sm font-medium">Status</th>
                <th className="p-2 text-left text-sm font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order: any) => (
                <tr key={order.id} className="border-b border-[rgb(var(--border))]">
                  <td className="p-2 text-sm font-mono">{order.orderNumber}</td>
                  <td className="p-2 text-sm">{order.customer?.name}</td>
                  <td className="p-2 text-sm">Rp {Number(order.grandTotal).toLocaleString()}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        order.orderStatus === 'COMPLETED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : order.orderStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-2 text-sm text-[rgb(var(--text-muted))]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Update Users with mobile card view**

```typescript
// apps/web/src/routes/admin/Users.tsx
import { useState } from 'react';
import { useUsers, useCreateUser } from '@/features/admin/hooks';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Button, Input, Select, Modal, Card, Badge, Skeleton, EmptyState } from '@/components/ui';

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'PRODUCT_PUBLISHER' });
  const { data, isLoading } = useUsers(page, search);
  const createUser = useCreateUser();
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(form, {
      onSuccess: () => { setShowCreate(false); setForm({ email: '', password: '', fullName: '', role: 'PRODUCT_PUBLISHER' }); },
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Users</h1>
        <Button onClick={() => setShowCreate(true)}>Add User</Button>
      </div>

      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="mb-4 max-w-md"
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: 'PRODUCT_PUBLISHER', label: 'Product Publisher' },
              { value: 'ADMIN_MAKER', label: 'Admin Maker' },
            ]}
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" loading={createUser.isPending}>Create</Button>
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : data?.users?.length === 0 ? (
        <Card>
          <EmptyState title="No users found" description="Create your first user to get started" />
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {data?.users?.map((u: any) => (
            <Card key={u.id} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{u.fullName}</p>
                  <p className="text-sm text-[rgb(var(--text-muted))]">{u.email}</p>
                </div>
                <Badge variant={u.status === 'ACTIVE' ? 'success' : 'error'}>
                  {u.status}
                </Badge>
              </div>
              <div className="mt-2">
                <Badge variant="accent">{u.roles[0]}</Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--bg-secondary))]">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Name</th>
                  <th className="p-3 text-left text-sm font-medium">Email</th>
                  <th className="p-3 text-left text-sm font-medium">Role</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.users?.map((u: any) => (
                  <tr key={u.id} className="border-t border-[rgb(var(--border))]">
                    <td className="p-3">{u.fullName}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3"><Badge variant="accent">{u.roles[0]}</Badge></td>
                    <td className="p-3"><Badge variant={u.status === 'ACTIVE' ? 'success' : 'error'}>{u.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-[rgb(var(--text-muted))]">
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(data!.totalPages, p + 1))}
              disabled={page >= data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /root/marketplace && git add apps/web/src/routes/admin/Dashboard.tsx apps/web/src/routes/admin/Users.tsx && git commit -m "feat: update Admin Dashboard and Users with responsive design"
```

---

## Task 17: Update Login Page and App.tsx

**Files:**
- Modify: `apps/web/src/routes/auth/Login.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Update Login page with new components**

```typescript
// apps/web/src/routes/auth/Login.tsx
import { useState } from 'react';
import { useLogin } from '@/features/auth/hooks';
import { Button, Input } from '@/components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[rgb(var(--bg-primary))] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[rgb(var(--bg-primary))] rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Marketplace Login</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate({ email, password });
            }}
            className="space-y-4"
          >
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {login.isError && (
              <p className="text-semantic-error text-sm">{(login.error as Error)?.message}</p>
            )}
            <Button
              type="submit"
              loading={login.isPending}
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update App.tsx to include Toast container**

```typescript
// apps/web/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '@/routes/auth/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboard from '@/routes/admin/Dashboard';
import AdminUsers from '@/routes/admin/Users';
import AdminCategories from '@/routes/admin/Categories';
import AdminBrands from '@/routes/admin/Brands';
import AdminSettings from '@/routes/admin/Settings';
import FormBuilderPage from '@/routes/admin/FormBuilder';
import Approvals from '@/routes/admin/Approvals';
import Reports from '@/routes/admin/Reports';
import AuditLogs from '@/routes/admin/AuditLogs';
import PublisherLayout from '@/components/layout/PublisherLayout';
import PublisherDashboard from '@/routes/publisher/Dashboard';
import PublisherProducts from '@/routes/publisher/Products';
import PublisherOrders from '@/routes/publisher/Orders';
import PublisherOrderDetail from '@/routes/publisher/OrderDetail';
import ProductForm from '@/routes/publisher/ProductForm';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import Home from '@/routes/storefront/Home';
import ProductList from '@/routes/storefront/ProductList';
import ProductDetail from '@/routes/storefront/ProductDetail';
import Cart from '@/routes/storefront/Cart';
import Checkout from '@/routes/storefront/Checkout';
import WriteReview from '@/routes/storefront/WriteReview';
import ToastContainer from '@/components/ui/Toast';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN_MAKER']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="form-builder" element={<FormBuilderPage />} />
            <Route path="form-builder/:id" element={<FormBuilderPage />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>
          <Route
            path="/publisher"
            element={
              <ProtectedRoute allowedRoles={['PRODUCT_PUBLISHER']}>
                <PublisherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PublisherDashboard />} />
            <Route path="products" element={<PublisherProducts />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="orders" element={<PublisherOrders />} />
            <Route path="orders/:id" element={<PublisherOrderDetail />} />
          </Route>
          <Route path="/" element={<StorefrontLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/:slug" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="write-review/:productId" element={<WriteReview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

- [ ] **Step 3: Commit**

```bash
cd /root/marketplace && git add apps/web/src/routes/auth/Login.tsx apps/web/src/App.tsx && git commit -m "feat: update Login page and add Toast container to App"
```

---

## Task 18: Final Build and Test

**Files:**
- None (verification only)

- [ ] **Step 1: Run TypeScript check**

Run: `cd /root/marketplace/apps/web && npx tsc --noEmit`
Expected: No errors (or warnings only)

- [ ] **Step 2: Run build**

Run: `cd /root/marketplace && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Run dev server and test manually**

Run: `cd /root/marketplace && npm run dev`
Test:
- Open http://localhost:5173 on desktop
- Open on mobile viewport (Chrome DevTools)
- Toggle dark mode
- Navigate through all pages
- Test cart flow
- Test admin panel on mobile

- [ ] **Step 4: Final commit with any fixes**

```bash
cd /root/marketplace && git add -A && git commit -m "fix: final adjustments for mobile responsive upgrade"
```

---

## Summary

**Total Tasks:** 18
**Estimated Time:** 4-6 hours

**Files Created:** 15 new files
**Files Modified:** 12 existing files

**Key Features:**
- Design tokens with dark mode support
- 10 shared UI components
- Mobile bottom tab bar navigation
- Mobile drawer navigation for admin/publisher
- Responsive layouts for all pages
- Skeleton loading states
- Empty states with CTAs
- Toast notifications
- Dark mode with system preference detection
- Touch-friendly targets (44px minimum)
