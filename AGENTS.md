# Marketplace Project Status

## Tech Stack
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + TanStack Query + Zustand + React Router v6
- **Backend:** Express.js + Prisma + PostgreSQL (Neon) + cookie-based sessions + Zod + bcrypt
- **Monorepo:** `apps/web/` (React/Vite), `apps/api/` (Express/Prisma), `packages/shared/`
- **Database:** Neon PostgreSQL, connection string di `.env`
- **Dev command:** `npm run dev` (concurrently runs both frontend & backend)

## Project Structure
```
/root/marketplace/
├── apps/
│   ├── api/          # Express backend (port 3001)
│   │   ├── prisma/   # schema.prisma + migrations
│   │   └── src/
│   │       ├── __tests__/   # API integration tests
│   │       ├── middleware/   # auth, rbac, validate, errorHandler, rateLimiter, audit
│   │       ├── routes/      # auth, admin/*, publisher/*, cart, orders, payment, shipping, storefront, wishlist, reviews, notifications
│   │       ├── services/    # business logic
│   │       └── validators/  # Zod schemas
│   └── web/          # React frontend (port 5173)
│       └── src/
│           ├── components/   # layout, forms, NotificationBell, SEOHead, MobileNav
│           ├── features/     # auth, admin, cart, form-builder, orders, payment, products, reviews, storefront, wishlist
│           ├── routes/       # auth, admin, publisher, storefront pages
│           └── stores/       # Zustand auth store
├── docs/
│   ├── sdot.md       # Single Document of Truth (2996 lines)
│   ├── specs/        # Design spec
│   └── plans/        # Implementation plan
└── package.json      # Root with concurrently
```

## Login Credentials
- Admin: `admin@marketplace.com` / `admin123`

## Completed Tasks (40/40)

### Phase 1-2: Foundation (DONE)
- [x] Project scaffolding (monorepo, Vite, Express, Prisma, Tailwind)
- [x] Database schema (30+ models, migrated to Neon)
- [x] Seed data (roles, admin user, settings)

### Phase 3-4: Auth + Admin APIs (DONE)
- [x] Auth system (login, session, RBAC middleware)
- [x] Admin APIs (users, categories, brands, settings)

### Phase 5-6: Admin Frontend + Form Builder (DONE)
- [x] Admin frontend (dashboard, users, categories, brands, settings)
- [x] Form Builder API + UI (category/variant form schemas)

### Phase 7: Publisher Products (DONE)
- [x] Publisher product management with dynamic forms
- [x] Product approval workflow (approve/reject)

### Phase 8: Storefront (DONE)
- [x] Public API (homepage, products, categories)
- [x] Storefront pages (home, product list, product detail)

### Phase 9: Cart + Checkout (DONE)
- [x] Shopping cart CRUD
- [x] Checkout flow
- [x] Order creation with multi-publisher splitting

### Phase 10: Payment + Shipping (DONE)
- [x] Midtrans payment integration (payment links + Snap)
- [x] RajaOngkir shipping integration

### Phase 11: Publisher Orders (DONE)
- [x] Publisher order management
- [x] AWB number management

### Phase 12: Notifications + Reviews (DONE)
- [x] In-app notifications
- [x] Product reviews

### Phase 13: Reports + Admin Views (DONE)
- [x] Admin dashboard with real stats
- [x] Sales reports
- [x] Publisher reports
- [x] Audit logs viewer

### Phase 14: Polish (DONE)
- [x] SEO meta tags
- [x] Responsive mobile design
- [x] Wishlist feature

### Phase 15: Testing (DONE)
- [x] API integration tests (11 passing)
- [x] Production build setup

### Phase 16: UI Polish (DONE)
- [x] Standardize rounded-sm (5px) on all buttons across 22+ files
- [x] Product cards: line-clamp-2 names, consistent price position (flex/mt-auto)
- [x] Cart: smaller +/- buttons (orange/white), publisher info, price whitespace-nowrap
- [x] Wishlist: product name 2 lines, price 1 line
- [x] Footer: redesigned shipping & payment logos (no scroll, center, no duplicates)
- [x] Banner: hide arrow navigation, keep dot indicators
- [x] Product detail: move question form below tabs, above related products
- [x] ProductList: icons on mobile category slider, remove Supported Couriers section
- [x] getCategoryIcon utility for category-specific icons

## Git History
```
e2063ed feat: UI polish - rounded-sm, product cards, cart, footer, banner
50ec052 feat: API tests and production build setup
d5b5a34 feat: SEO, responsive design, and wishlist
72f9edf feat: admin reports, audit logs, and dashboard
f19b1d6 feat: notifications and product reviews
a3bebf2 feat: publisher order management with AWB
34a8c3c feat: Midtrans payment and RajaOngkir shipping integration
caa273d feat: shopping cart, checkout, and order splitting
23ec8b4 feat: storefront with homepage, product listing, and product detail
296296c feat: product approval workflow with approve/reject
151e0df feat: publisher product management with dynamic forms
1a6a43e feat: form builder API and UI for category/variant schemas
9c66204 feat: add pagination controls to admin users page
79121b5 feat: admin frontend with layout, dashboard, users, categories, brands, settings
6cdda54 fix: add Zod validation to admin fee update endpoint
4e5871f feat: admin APIs for users, categories, brands, settings
915c857 fix: move setUser to onSuccess, add htmlFor/id for a11y, type login response
a05331b feat: frontend auth with login page, auth store, protected routes
4073c78 fix: wrap async authenticate middleware in try/catch
ac20a90 feat: auth system with login, session, RBAC middleware
d6e1012 feat: seed script with roles and initial admin
```

## Known Issues / TODO
- [ ] Midtrans & RajaOngkir use sandbox/test credentials (need real keys for production)
- [ ] Shipping cost in checkout is hardcoded (needs proper origin address setup)
- [ ] Some frontend TS errors from schema mismatches (non-critical, pages work)
- [ ] No image upload to cloud storage (media URLs are placeholder)
- [ ] No email notifications (only in-app)
- [ ] No rate limiting on storefront public routes

## How to Run
```bash
cd /root/marketplace
npm run dev          # Runs both frontend + backend
npm run dev:web      # Frontend only
npm run dev:api      # Backend only
npm test             # Run API tests
npm run build        # Production build
```

## Environment Variables (`.env`)
- `DATABASE_URL` — Neon PostgreSQL connection string
- `MIDTRANS_SERVER_KEY` — Midtrans payment gateway key
- `MIDTRANS_CLIENT_KEY` — Midtrans client key
- `RAJAONGKIR_API_KEY` — RajaOngkir shipping API key
