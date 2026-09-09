# Mobile Responsive & Professional UX Upgrade

## Overview

Upgrade the frontend to be fully mobile responsive and professional-quality. This includes a design system, shared component library, mobile navigation, and consistent UX patterns across all pages.

**Approach:** Critical Path Hybrid — build design tokens + core components first, upgrade storefront pages (highest revenue impact), then admin panel.

**Design Direction:** Rich/Feature-dense — bold colors, dense information, data-heavy (think: Notion, Figma).

**Date:** 2026-09-10

---

## 1. Design Tokens & Color System

### Typography Scale
```
text-xs:   12px  (captions, labels)
text-sm:   14px  (secondary text)
text-base: 16px  (body)
text-lg:   18px  (subheadings)
text-xl:   20px  (card titles)
text-2xl:  24px  (section headings)
text-3xl:  30px  (page titles)
text-4xl:  36px  (hero text)
```

### Color Tokens (Light/Dark)
```
--bg-primary:      white / #0f0f0f
--bg-secondary:    #f5f5f5 / #1a1a1a
--bg-tertiary:     #e5e5e5 / #262626

--text-primary:    #0a0a0a / #fafafa
--text-secondary:  #525252 / #a3a3a3
--text-muted:      #737373 / #737373

--accent:          #f97316 (orange-500)
--accent-hover:    #ea580c (orange-600)

--border:          #e5e5e5 / #262626
--border-focus:    #f97316

--success:         #22c55e
--error:           #ef4444
--warning:         #eab308
```

### Spacing Scale
```
space-1:  4px
space-2:  8px
space-3:  12px
space-4:  16px
space-5:  20px
space-6:  24px
space-8:  32px
space-10: 40px
space-12: 48px
```

### Border Radius
```
rounded-sm:  4px   (inputs, badges)
rounded:     8px   (cards, buttons)
rounded-lg:  12px  (modals, large cards)
rounded-xl:  16px  (bottom sheets)
rounded-full: 9999px (avatars, icons)
```

---

## 2. Component Library

### Core Components

**Button**
- Variants: primary, secondary, ghost, destructive, outline
- Sizes: sm (32px), md (40px), lg (48px)
- States: default, hover, active, disabled, loading
- Loading shows spinner, maintains width

**Input / Select / Textarea**
- Label always visible (not placeholder)
- Helper text below
- Error state with message
- Focus ring using accent color
- inputmode for mobile keyboards

**Card**
- Variants: elevated (shadow), outlined (border), filled (bg)
- Padding: space-4 to space-6
- Hover state for clickable cards

**Badge**
- Variants: default, success, warning, error, accent
- Sizes: sm, md
- Pill shape (rounded-full)

**Modal / Dialog**
- Slide-up on mobile (bottom sheet)
- Centered on desktop
- Backdrop blur
- Close on escape, click outside
- Focus trap

**Toast / Notification**
- Slide in from top-right (desktop) or top (mobile)
- Variants: success, error, info
- Auto-dismiss after 5s (success) or persist (error)
- Stack up to 3

**Skeleton**
- Shimmer animation
- Match real content shapes
- Delay 200ms before showing

**Empty State**
- SVG icon (48x48, muted color)
- Title (text-lg, font-semibold)
- Description (text-sm, text-secondary)
- Primary CTA button

---

## 3. Mobile Navigation

### Storefront Mobile (Bottom Tab Bar)
```
┌─────────────────────────────────────┐
│                                     │
│           (page content)            │
│                                     │
├─────────────────────────────────────┤
│  🏠      🔍      🛒      👤       │
│  Home   Search   Cart   Account     │
└─────────────────────────────────────┘
```

- Fixed bottom, 64px height
- Safe area padding for iPhone notch
- Icons + labels
- Active state: accent color
- Badge on cart icon (item count)
- Hide on scroll down, show on scroll up

### Storefront Mobile (Top Bar)
```
┌─────────────────────────────────────┐
│  ☰  Marketplace          🔔 👤    │
└─────────────────────────────────────┘
```

- Hamburger for secondary nav (categories, orders, wishlist)
- Notification bell with badge
- User avatar/login

### Admin/Publisher Mobile (Drawer + Cards)
```
┌─────────────────────────────────────┐
│  ☰  Admin Dashboard                │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Dashboard        →          │   │
│  ├─────────────────────────────┤   │
│  │ Users            →          │   │
│  ├─────────────────────────────┤   │
│  │ Categories       →          │   │
│  └─────────────────────────────┘   │
│                                     │
│  (content adapts: tables → cards)   │
└─────────────────────────────────────┘
```

- Hamburger opens left drawer
- Overlay backdrop
- Swipe left to close (touch gesture, min 100px swipe)
- Tap backdrop to close
- ESC key to close on desktop
- Tables become scrollable cards on mobile

---

## 4. Storefront Pages

### Home Page
- Hero: Full-width gradient, large text, CTA button
- Categories: 2-col mobile, 4-col desktop, icon + name
- Featured Products: 2-col mobile, 4-col desktop
- Product cards: Image, category, name, price, publisher
- Loading: Skeleton grid matching layout

### Product List
- Sticky filter bar on mobile (category chips)
- Sort dropdown (not inline select)
- Product grid: 2-col mobile, 3-col desktop
- Pagination: number buttons (not prev/next only)
- Empty state: "No products match '[search]'" with clear button

### Product Detail
- Image gallery: swipeable carousel on mobile
- Sticky add-to-cart bar at bottom on scroll
- Price, rating, stock, variants
- Seller info card
- Description (prose styling)
- Related products: horizontal scroll on mobile
- Empty state: "Product not found" with back link

### Cart
- Item list with image, name, variant, price
- Quantity controls: +/- buttons (44px touch targets)
- Swipe to remove (with undo toast)
- Sticky total bar at bottom
- Empty state: "Your cart is empty" with illustration + browse button

### Checkout
- 1-column on mobile (stacked)
- 2-column on desktop (address + summary)
- Form inputs with proper types (text, tel, etc.)
- Order summary sticky on desktop
- Loading state on place order button

---

## 5. Admin Panel

### Desktop Layout
- 256px sidebar (fixed)
- Main content area with max-width
- Header with page title + actions

### Mobile Layout (Drawer + Cards)
- Hamburger opens left drawer (slide-in)
- Overlay backdrop, swipe to close
- Tables become card lists:

**User Card (Mobile):**
```
┌─────────────────────────────┐
│  👤 John Doe                │
│  john@example.com           │
│  ┌──────────┐  ┌────────┐  │
│  │ PUBLISHER│  │ ACTIVE │  │
│  └──────────┘  └────────┘  │
└─────────────────────────────┘
```

**Order Card (Mobile):**
```
┌─────────────────────────────┐
│  #ORD-001        Rp 1.2M   │
│  Customer: John Doe         │
│  Status: COMPLETED          │
│  Date: 2024-01-15           │
└─────────────────────────────┘
```

### Dashboard
- Stat cards: 2-col mobile, 5-col desktop
- Recent orders table → card list on mobile
- Loading: skeleton cards

### Forms (Create/Edit)
- Full-screen modals on mobile
- Sidebar panels on desktop
- Proper input types and validation
- Loading states on submit buttons

---

## 6. Empty States & Errors

### Empty States

**First Use (No Data):**
```
┌─────────────────────────────┐
│                             │
│         [illustration]      │
│                             │
│    No products yet          │
│    Add your first product   │
│    to get started.          │
│                             │
│    [Add Product]            │
│                             │
└─────────────────────────────┘
```

**No Results (Search/Filter):**
```
┌─────────────────────────────┐
│                             │
│         [illustration]      │
│                             │
│    No products match        │
│    "xyz"                    │
│                             │
│    [Clear Filters]          │
│                             │
└─────────────────────────────┘
```

**Success (All Done):**
```
┌─────────────────────────────┐
│                             │
│         [illustration]      │
│                             │
│    All caught up!           │
│    Nothing needs review.    │
│                             │
└─────────────────────────────┘
```

### Error States

**Recoverable (Network/Timeout):**
```
┌─────────────────────────────┐
│                             │
│    ⚠️ Couldn't load data    │
│    Check your connection.   │
│                             │
│    [Retry]                  │
│                             │
└─────────────────────────────┘
```

**Not Found (404):**
```
┌─────────────────────────────┐
│                             │
│    Page not found           │
│    This page doesn't exist  │
│    or was removed.          │
│                             │
│    [Go Home]                │
│                             │
└─────────────────────────────┘
```

**Permission (403):**
```
┌─────────────────────────────┐
│                             │
│    Access denied             │
│    You don't have permis-   │
│    sion to view this page.  │
│                             │
│    [Go Back]                │
│                             │
└─────────────────────────────┘
```

### Toast Notifications
- Success: green, auto-dismiss 5s
- Error: red, persist until dismissed
- Info: blue, auto-dismiss 5s
- Stack from top-right

---

## 7. Animations & Transitions

### Page Transitions
- Fade in: 200ms ease-out
- Slide up: 200ms ease-out (mobile)
- No transition on first load

### Micro-interactions

**Button Press:**
- Scale down to 98% on click
- 100ms ease

**Card Hover:**
- Shadow elevation change
- 150ms ease

**Skeleton Shimmer:**
- Gradient animation
- 1.5s infinite

**Toast:**
- Slide in from right (desktop) or top (mobile)
- 300ms ease-out
- Fade out on dismiss

**Drawer/Modal:**
- Slide in from left (drawer) or bottom (mobile modal)
- 250ms ease-out
- Backdrop fade in 200ms

### Loading States

**Button Loading:**
- Spinner icon replaces text
- Maintains width
- Disabled during load

**Page Loading:**
- Skeleton matching layout
- Shows after 200ms delay
- Shimmer animation

**Pull to Refresh:**
- Spinner at top
- Haptic feedback via navigator.vibrate(10) on supported devices

### Reduced Motion
- Respect `prefers-reduced-motion`
- Disable non-essential animations
- Keep loading indicators

---

## 8. Dark Mode

### Detection
- System preference via `prefers-color-scheme`
- Manual toggle in header/account menu
- Stored in localStorage

### Color Mapping

**Light → Dark:**
```
white      → #0f0f0f (gray-950)
#f5f5f5    → #1a1a1a (gray-900)
#e5e5e5    → #262626 (gray-800)
#0a0a0a    → #fafafa (gray-50)
#525252    → #a3a3a3 (gray-400)
#737373    → #737373 (gray-500, unchanged)
```

**Accent (unchanged):**
```
#f97316    → #f97316 (orange-500)
#ea580c    → #ea580c (orange-600)
```

### Implementation
- CSS variables for all colors
- Tailwind `dark:` prefix
- Toggle button in header
- System preference as default

### Components
- Cards: dark bg with subtle border
- Inputs: dark bg, lighter border
- Modals: dark bg, backdrop blur
- Tables: alternating dark rows

---

## 9. Implementation Phases

### Phase 1: Design System Foundation (Day 1)
- [ ] Update tailwind.config.ts with tokens
- [ ] Create globals.css with CSS variables
- [ ] Add dark mode support

### Phase 2: Core Components (Day 1-2)
- [ ] Button component
- [ ] Input/Select/Textarea components
- [ ] Card component
- [ ] Badge component
- [ ] Modal/Dialog component
- [ ] Toast/Notification component
- [ ] Skeleton component
- [ ] EmptyState component

### Phase 3: Storefront Mobile (Day 2-3)
- [ ] Bottom tab bar navigation
- [ ] Top bar with hamburger
- [ ] Home page responsive
- [ ] Product list responsive
- [ ] Product detail responsive
- [ ] Cart responsive
- [ ] Checkout responsive

### Phase 4: Admin Mobile (Day 3-4)
- [ ] Drawer navigation
- [ ] Table → Card conversion
- [ ] Dashboard responsive
- [ ] User management responsive
- [ ] Forms responsive

### Phase 5: Polish (Day 4)
- [ ] Animations & transitions
- [ ] Empty states with illustrations
- [ ] Error states
- [ ] Dark mode toggle
- [ ] Final QA pass

---

## 10. Success Criteria

- [ ] All pages work on mobile (320px+)
- [ ] All pages work on desktop (1024px+)
- [ ] Touch targets ≥ 44px
- [ ] Dark mode works
- [ ] Loading states show skeletons
- [ ] Empty states have illustrations + CTAs
- [ ] Error states have retry/fallback
- [ ] Animations respect prefers-reduced-motion
- [ ] No horizontal scroll on mobile
- [ ] Forms have proper input types
