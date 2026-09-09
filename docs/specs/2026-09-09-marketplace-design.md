# Marketplace Technical Implementation Design

**Date:** 2026-09-09
**Status:** Approved
**Source of Truth:** `docs/sdot.md`

---

## 1. Overview

This document defines the **technical implementation** for the Marketplace application. All business rules, actors, workflows, database tables, APIs, and acceptance criteria are defined in `docs/sdot.md`. This spec adds the technology choices, project structure, and implementation patterns.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + Vite + TypeScript | SDOT requirement |
| Styling | Tailwind CSS | Utility-first, rapid development, customizable theme |
| State (Server) | TanStack Query (React Query) | Server state caching, refetching, optimistic updates |
| State (Client) | Zustand | Lightweight global state for auth, cart, UI |
| Routing | React Router v6 | Nested routes, lazy loading, code splitting |
| Backend | Express.js + TypeScript | Mature, middleware ecosystem, widely documented |
| ORM | Prisma | Type-safe, schema-first, migration support, PostgreSQL-native |
| Database | PostgreSQL / Neon | SDOT requirement |
| Auth | Cookie-based sessions (express-session + connect-pg-simple) | Secure httpOnly cookies, server-side session store |
| Validation | Zod | Type-safe request validation, shared schemas |
| Password Hashing | bcrypt | Industry standard |
| Payment | Midtrans | SDOT requirement |
| Shipping | RajaOngkir | SDOT requirement |
| Image Upload | Local storage + static serving (extensible to S3) | Start simple, upgrade later |

---

## 3. Project Structure

```
marketplace/
├── apps/
│   ├── web/                          # React + Vite frontend
│   │   ├── src/
│   │   │   ├── main.tsx              # Entry point
│   │   │   ├── App.tsx               # Router setup
│   │   │   ├── routes/               # Route components
│   │   │   │   ├── storefront/       # Customer-facing pages
│   │   │   │   │   ├── Home.tsx
│   │   │   │   │   ├── ProductList.tsx
│   │   │   │   │   ├── ProductDetail.tsx
│   │   │   │   │   ├── Cart.tsx
│   │   │   │   │   ├── Checkout.tsx
│   │   │   │   │   ├── OrderResult.tsx
│   │   │   │   │   ├── OrderLookup.tsx
│   │   │   │   │   └── Review.tsx
│   │   │   │   ├── admin/            # Admin Maker pages
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── Users.tsx
│   │   │   │   │   ├── Categories.tsx
│   │   │   │   │   ├── FormBuilder.tsx
│   │   │   │   │   ├── Brands.tsx
│   │   │   │   │   ├── Products.tsx
│   │   │   │   │   ├── ProductApproval.tsx
│   │   │   │   │   ├── Orders.tsx
│   │   │   │   │   ├── Payments.tsx
│   │   │   │   │   ├── Shipments.tsx
│   │   │   │   │   ├── Reports.tsx
│   │   │   │   │   ├── Settings.tsx
│   │   │   │   │   ├── AuditLogs.tsx
│   │   │   │   │   └── Reviews.tsx
│   │   │   │   ├── publisher/        # Product Publisher pages
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── Products.tsx
│   │   │   │   │   ├── ProductForm.tsx
│   │   │   │   │   ├── Orders.tsx
│   │   │   │   │   ├── OrderDetail.tsx
│   │   │   │   │   ├── Notifications.tsx
│   │   │   │   │   └── Profile.tsx
│   │   │   │   └── auth/
│   │   │   │       ├── Login.tsx
│   │   │   │       └── Logout.tsx
│   │   │   ├── components/           # Reusable UI components
│   │   │   │   ├── ui/               # Button, Input, Card, Modal, Table, etc.
│   │   │   │   ├── layout/           # Header, Footer, Sidebar, PageWrapper
│   │   │   │   ├── forms/            # DynamicForm, FieldRenderer, FormBuilder
│   │   │   │   └── shared/           # Pagination, Search, Loading, Empty
│   │   │   ├── features/             # Feature modules
│   │   │   │   ├── auth/             # useLogin, useLogout, useMe
│   │   │   │   ├── cart/             # Cart operations, useCart
│   │   │   │   ├── products/         # Product queries, mutations
│   │   │   │   ├── categories/       # Category queries
│   │   │   │   ├── form-builder/     # Form builder logic
│   │   │   │   ├── checkout/         # Checkout flow
│   │   │   │   ├── orders/           # Order queries
│   │   │   │   ├── payments/         # Payment flow
│   │   │   │   ├── shipping/         # Shipping calculation
│   │   │   │   ├── notifications/    # Notification polling
│   │   │   │   └── reviews/          # Review operations
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── lib/                  # Utilities
│   │   │   │   ├── api.ts            # API client (fetch wrapper)
│   │   │   │   ├── query.ts          # TanStack Query config
│   │   │   │   └── utils.ts          # Helpers (formatCurrency, etc.)
│   │   │   ├── stores/               # Zustand stores
│   │   │   │   ├── auth.ts           # Auth state
│   │   │   │   ├── cart.ts           # Cart state (session-based)
│   │   │   │   └── ui.ts             # Sidebar, modals, etc.
│   │   │   └── styles/
│   │   │       └── globals.css       # Tailwind imports + custom styles
│   │   ├── index.html
│   │   ├── tailwind.config.ts
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # Express.js backend
│       ├── src/
│       │   ├── index.ts              # Server entry point
│       │   ├── app.ts                # Express app setup
│       │   ├── routes/               # Route definitions
│       │   │   ├── auth.ts           # POST /login, /logout, GET /me
│       │   │   ├── admin/            # Admin routes
│       │   │   │   ├── users.ts
│       │   │   │   ├── categories.ts
│       │   │   │   ├── form-builder.ts
│       │   │   │   ├── brands.ts
│       │   │   │   ├── products.ts
│       │   │   │   ├── orders.ts
│       │   │   │   ├── reports.ts
│       │   │   │   ├── settings.ts
│       │   │   │   └── reviews.ts
│       │   │   ├── publisher/        # Publisher routes
│       │   │   │   ├── products.ts
│       │   │   │   ├── orders.ts
│       │   │   │   ├── categories.ts
│       │   │   │   └── profile.ts
│       │   │   ├── public/           # Public storefront routes
│       │   │   │   ├── products.ts
│       │   │   │   ├── categories.ts
│       │   │   │   └── brands.ts
│       │   │   ├── cart.ts
│       │   │   ├── checkout.ts
│       │   │   ├── payments.ts
│       │   │   ├── shipping.ts
│       │   │   ├── orders.ts         # Customer order lookup
│       │   │   ├── reviews.ts
│       │   │   └── notifications.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts           # authenticate()
│       │   │   ├── rbac.ts           # authorize(role), authorizePublisherOwnership()
│       │   │   ├── validate.ts       # Zod validation middleware
│       │   │   ├── errorHandler.ts   # Global error handler
│       │   │   ├── rateLimiter.ts    # Rate limiting
│       │   │   └── audit.ts          # Audit logging middleware
│       │   ├── services/             # Business logic
│       │   │   ├── auth.service.ts
│       │   │   ├── user.service.ts
│       │   │   ├── category.service.ts
│       │   │   ├── form-builder.service.ts
│       │   │   ├── product.service.ts
│       │   │   ├── approval.service.ts
│       │   │   ├── cart.service.ts
│       │   │   ├── checkout.service.ts
│       │   │   ├── order.service.ts
│       │   │   ├── payment.service.ts
│       │   │   ├── shipping.service.ts
│       │   │   ├── notification.service.ts
│       │   │   ├── review.service.ts
│       │   │   ├── report.service.ts
│       │   │   └── audit.service.ts
│       │   ├── lib/
│       │   │   ├── prisma.ts         # Prisma client singleton
│       │   │   ├── session.ts        # Session config
│       │   │   ├── midtrans.ts       # Midtrans client
│       │   │   ├── rajaongkir.ts     # RajaOngkir client
│       │   │   └── utils.ts          # Helpers
│       │   └── validators/           # Zod schemas
│       │       ├── auth.schema.ts
│       │       ├── user.schema.ts
│       │       ├── category.schema.ts
│       │       ├── product.schema.ts
│       │       ├── checkout.schema.ts
│       │       └── ...
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── seed.ts               # Initial data (admin user, roles)
│       │   └── migrations/
│       ├── uploads/                  # Product images
│       ├── .env
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared types & validators
│       ├── src/
│       │   ├── types/                # TypeScript interfaces
│       │   ├── constants/            # Shared constants (roles, statuses)
│       │   └── validators/           # Shared Zod schemas
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   ├── sdot.md
│   └── specs/
│       └── 2026-09-09-marketplace-design.md
│
├── package.json                      # Root workspace (npm workspaces)
├── .gitignore
└── .env
```

---

## 4. Database Design (Prisma Schema Mapping)

### 4.1 Prisma Schema Conventions

- **UUID PKs**: `@id @default(uuid())`
- **Foreign keys**: `@relation(name)` with explicit references
- **JSONB fields**: `Json` type
- **NUMERIC(18,2)**: `Decimal` (Prisma returns as `string` for precision)
- **Timestamps**: `@default(now()) @updatedAt`
- **Soft deletes**: Not used — SDOT uses explicit statuses (ARCHIVED, etc.)

### 4.2 Key Tables

| Table | Prisma Model | Key Notes |
|-------|-------------|-----------|
| users | User | UUID PK, email unique, password_hash |
| roles | Role | name unique (ADMIN_MAKER, PRODUCT_PUBLISHER) |
| user_roles | UserRole | Composite PK (user_id, role_id) |
| publisher_profiles | PublisherProfile | 1:1 with User, unique user_id |
| categories | Category | name/slug unique, status |
| category_form_schemas | CategoryFormSchema | version + category_id, status (DRAFT/PUBLISHED) |
| category_form_fields | CategoryFormField | JSONB options/validation_rules, sort_order |
| variant_form_schemas | VariantFormSchema | Same pattern as category |
| variant_form_fields | VariantFormField | Same pattern as category |
| brands | Brand | name/slug unique |
| products | Product | FK publisher, category, brand, schema. JSONB category_form_data |
| product_variants | ProductVariant | FK product, variant schema. JSONB variant_form_data |
| product_media | ProductMedia | Max 5 per product (enforced in service layer) |
| product_approval_history | ProductApprovalHistory | Audit trail for approvals |
| customers | Customer | No auth — guest checkout |
| customer_addresses | CustomerAddress | FK customer |
| carts | Cart | session_id based (no auth required) |
| cart_items | CartItem | FK cart, product, variant |
| checkout_sessions | CheckoutSession | Groups multi-publisher orders |
| orders | Order | 1 order = 1 publisher. Snapshot fields. |
| order_items | OrderItem | Full price snapshots per item |
| payments | Payment | FK checkout_session + order |
| payment_transactions | PaymentTransactions | Webhook event log, idempotency |
| shipments | Shipment | 1:1 with order, manual AWB |
| shipping_tracking | ShippingTracking | Tracking events |
| notifications | Notification | FK user, reference_type/id |
| reviews | Review | FK product, order, order_item |
| audit_logs | AuditLog | actor, action, entity, old/new data |
| settings | Settings | Key-value with JSONB value |

### 4.3 Critical Relationships

```
User ── UserRole ── Role
User ── PublisherProfile ── Product ── ProductVariant
                                ├── ProductMedia
                                └── ProductApprovalHistory

Category ── CategoryFormSchema ── CategoryFormField
Category ── VariantFormSchema ── VariantFormField

Cart ── CartItem ── Product (+ variant)

CheckoutSession ── Order ── OrderItem
                       ├── Shipment ── ShippingTracking
                       └── Payment ── PaymentTransaction

Customer ── CustomerAddress

User ── Notification
Product ── Review
User ── AuditLog
```

---

## 5. Authentication & Authorization

### 5.1 Session Management

- Library: `express-session` with `connect-pg-simple` store
- Cookie: httpOnly, secure (production), sameSite: lax
- Session stored in PostgreSQL `session` table (auto-created by connect-pg-simple)
- Session lifetime: configurable via AUTH_SECRET + expiry

### 5.2 Middleware Stack

```typescript
// Per-request middleware chain:
1. authenticate()     // Reads session cookie, loads user + roles from DB
2. authorize(role)    // Checks user has required role
3. authorizePublisherOwnership()  // Checks resource.publisher_id matches
```

### 5.3 RBAC Matrix

| Action | ADMIN_MAKER | PRODUCT_PUBLISHER |
|--------|------------|-------------------|
| Login | ✓ | ✓ |
| Dashboard (admin) | ✓ | ✗ |
| Dashboard (publisher) | ✗ | ✓ |
| Manage users | ✓ | ✗ |
| Manage categories | ✓ | ✗ |
| Build forms | ✓ | ✗ |
| View all products | ✓ | ✗ |
| View own products | ✗ | ✓ |
| Create/edit own products | ✗ | ✓ |
| Submit for approval | ✗ | ✓ |
| Approve/reject products | ✓ | ✗ |
| View all orders | ✓ | ✗ |
| View own orders | ✗ | ✓ |
| Process own orders | ✗ | ✓ |
| Input AWB (own orders) | ✗ | ✓ |
| View reports | ✓ | ✗ |
| Manage settings | ✓ | ✗ |
| View audit logs | ✓ | ✗ |

### 5.4 Ownership Enforcement

Every publisher endpoint must verify on the backend:

```typescript
// Pattern:
const product = await prisma.product.findUnique({ where: { id } });
if (product.publisher_id !== authenticatedPublisher.id) {
  throw new ForbiddenError('OWNERSHIP_FORBIDDEN');
}
```

Frontend filtering is NOT security — backend is the gatekeeper.

---

## 6. API Design

### 6.1 Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

### 6.2 Validation

All requests validated with Zod schemas before reaching service layer. Validation errors return `VALIDATION_ERROR` with field-level details.

### 6.3 Error Codes

Defined in SDOT section 97. All mapped to appropriate HTTP status codes:

| Code | HTTP Status |
|------|------------|
| AUTH_REQUIRED | 401 |
| FORBIDDEN | 403 |
| NOT_FOUND | 404 |
| VALIDATION_ERROR | 400 |
| PRODUCT_NOT_AVAILABLE | 404 |
| INSUFFICIENT_STOCK | 409 |
| PRICE_CHANGED | 409 |
| PAYMENT_FAILED | 402 |
| RATE_LIMITED | 429 |
| INTERNAL_ERROR | 500 |

---

## 7. Dynamic Form Builder Implementation

### 7.1 Schema Storage

- `category_form_schemas`: One row per version per category
- `category_form_fields`: All fields for that schema version
- `variant_form_schemas` / `variant_form_fields`: Same pattern

### 7.2 Field Types

TEXT, TEXTAREA, NUMBER, DECIMAL, SELECT, MULTI_SELECT, RADIO, CHECKBOX, DATE, BOOLEAN, IMAGE, FILE

Each field stores:
- `field_key`: Unique identifier within schema (e.g., "material", "gender")
- `label`: Display label
- `field_type`: One of the types above
- `required`: Boolean
- `options`: JSONB array (for SELECT, MULTI_SELECT, RADIO, CHECKBOX)
- `validation_rules`: JSONB (min, max, pattern, etc.)
- `sort_order`: Display order

### 7.3 Schema Versioning

```
Admin creates schema → v1 (DRAFT)
Admin publishes → v1 (PUBLISHED)
Admin edits → v2 (DRAFT)
Admin publishes → v2 (PUBLISHED), v1 → ARCHIVED
```

Products reference `category_form_schema_id` — old products keep their schema version.

### 7.4 Dynamic Form Rendering

```
Publisher selects category
  → GET /api/publisher/categories/:id/form-schema
  → Returns active (PUBLISHED) schema with fields
  → Frontend renders form dynamically based on field_type
  → On submit, backend validates JSONB against schema
```

### 7.5 Backend Validation

```typescript
async function validateDynamicData(schemaId: string, data: Record<string, any>) {
  const fields = await prisma.categoryFormField.findMany({
    where: { schema_id: schemaId, status: 'ACTIVE' }
  });

  for (const field of fields) {
    if (field.required && !data[field.field_key]) {
      throw new ValidationError(`${field.label} is required`);
    }
    // Type-specific validation...
  }
}
```

---

## 8. Product & Pricing

### 8.1 Price Calculation (Backend Only)

```typescript
function calculatePricing(bestPrice: number, adminFeePercentage: number) {
  const adminFeeAmount = bestPrice * adminFeePercentage / 100;
  const marketplacePrice = bestPrice + adminFeeAmount;
  return { adminFeeAmount, marketplacePrice };
}
```

- Admin Fee configured in `settings` table
- Best Price set by Publisher
- Marketplace Price = Best Price + Admin Fee
- **Never trust frontend-supplied prices**

### 8.2 SKU Generation

Backend generates unique SKUs:
```
Format: [CATEGORY_PREFIX]-[PUBLISHER_PREFIX]-[TIMESTAMP]-[RANDOM]
Example: SHO- PUB01-20260909-A3F2
```

### 8.3 Product Images

- Stored in `uploads/` directory
- Served as static files via Express
- Max 5 images enforced in service layer
- Each image: URL, alt_text, sort_order

### 8.4 Stock Management

- Stock reserved at checkout time (decremented inside transaction)
- Database transaction with row-level locking (`SELECT ... FOR UPDATE`) to prevent overselling
- Payment failure/expiry releases reserved stock (increments back)
- Payment confirmation: stock already reserved, no additional action needed
- SDOT section 96: Reserve Stock → Create Order → COMMIT; on failure → ROLLBACK releases stock

---

## 9. Cart & Checkout

### 9.1 Cart

- Session-based (no auth required for guest)
- `cart.session_id` from browser session cookie
- Cart items reference product + optional variant
- Real-time stock validation on add/view

### 9.2 Checkout Flow

```
1. Validate all cart items (product exists, published, variant valid, stock available)
2. Validate prices (compare current vs cart)
3. Group items by publisher_id
4. For each publisher group:
   a. BEGIN TRANSACTION
   b. Reserve stock (UPDATE products SET stock = stock - quantity WHERE ...)
   c. Create order with snapshot pricing
   d. Create order_items with full snapshots
   e. Create shipment record
   f. Create payment record
   g. COMMIT
5. Create Midtrans transaction (one per checkout session)
6. Return payment redirect URL
```

### 9.3 Order Splitting

Cart with items from Publisher A + Publisher B:
```
Checkout Session
├── Order A (Publisher A items)
└── Order B (Publisher B items)
```

Each order has:
- Unique order_number
- Own publisher_id
- Own price snapshots
- Own shipment
- Own payment

---

## 10. Payment (Midtrans)

### 10.1 Flow

```
Checkout → Create Midtrans Transaction → Redirect to payment page
Customer pays → Midtrans Webhook → POST /api/payments/midtrans/notification
```

### 10.2 Webhook Processing

```
1. Receive webhook payload
2. Verify signature (Midtrans signature key)
3. Validate amount matches expected
4. Validate order reference
5. Idempotency check (payment_transactions table)
6. Update payment status
7. Update order status
8. If PAID: trigger publisher notifications, release stock reservation
9. Record event in payment_transactions
```

### 10.3 Security

- Midtrans server key ONLY in backend `.env`
- Frontend never touches payment status
- Webhook verification prevents spoofing

---

## 11. Shipping (RajaOngkir)

### 11.1 Integration

- Province/city/district lookup via RajaOngkir API
- Shipping cost calculation: origin (publisher address) + destination + weight
- Returns courier options with pricing

### 11.2 Manual Courier Flow

```
PAID → Publisher PROCESSING → PACKED → Hand to courier → Receive AWB → Publisher inputs AWB → SHIPPED
```

No automatic booking — publisher manually hands off to courier and inputs AWB.

---

## 12. Notifications

### 12.1 Types

- **ORDER_PAID**: Sent to publisher when payment confirmed
- **ORDER_STATUS_CHANGE**: Status updates
- **PRODUCT_APPROVED**: Product approved by admin
- **PRODUCT_REJECTED**: Product rejected with reason

### 12.2 Implementation

- Stored in `notifications` table
- Polled by frontend (or WebSocket for real-time — future enhancement)
- Publisher dashboard shows unread count

---

## 13. Reports

### 13.1 Sales Report

Filters: date range, publisher
Metrics: Total Best Price, Total Marketplace Price, Profit, Products Sold, Orders

Formula (from snapshots, never live prices):
```
Total Best Price = Σ(best_price_snapshot × quantity)
Total Marketplace Price = Σ(marketplace_price_snapshot × quantity)
Profit = Total Marketplace Price - Total Best Price
```

Shipping excluded from profit calculation.

---

## 14. Visual Theme

### 14.1 Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary (dominant) | Black | `#000000` |
| Secondary | Dark Gray | `#1a1a1a`, `#333333` |
| Surface | White / Light Gray | `#ffffff`, `#f5f5f5` |
| Accent | Orange | `#f97316`, `#ea580c` |
| Text | White on dark, Dark on light | — |
| Border | Gray | `#e5e7eb`, `#d1d5db` |

### 14.2 Typography

System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

### 14.3 Component Style

- Bold, premium, clean, modern
- Rounded corners (small radius)
- Subtle shadows for cards
- Orange accent for CTAs, badges, active states
- Dark sidebar for admin/publisher dashboards
- White content area

---

## 15. SEO (Storefront)

- React Helmet for `<title>`, `<meta>`, `<link rel="canonical">`
- Open Graph tags for product pages
- JSON-LD structured data for products
- Clean slug-based URLs: `/products/:slug`, `/categories/:slug`
- Only PUBLISHED products in sitemap
- Server-rendered meta via API response (or future SSR enhancement)

---

## 16. Responsive Design

- Mobile-first with Tailwind breakpoints
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Storefront: single-column mobile → multi-column desktop
- Admin/Publisher: collapsible sidebar → hamburger menu on mobile

---

## 17. Testing Strategy

### 17.1 Unit Tests

- Vitest as test runner
- Price calculation functions
- Stock validation logic
- Dynamic form validation
- Order splitting logic
- Status transitions

### 17.2 Integration Tests

- Supertest for API endpoints
- Auth flows
- RBAC enforcement
- Ownership checks
- Checkout with DB transactions
- Payment webhook processing
- Shipping calculation

### 17.3 E2E Tests

- Playwright for browser tests
- Full user flows: product creation → approval → purchase → delivery → review

---

## 18. Security Checklist

- [ ] Password hashing (bcrypt, salt rounds ≥ 12)
- [ ] httpOnly secure cookies
- [ ] CORS restriction (allow only APP_URL)
- [ ] CSRF protection (SameSite cookies + origin check)
- [ ] Rate limiting on auth endpoints and order lookup
- [ ] Input validation (Zod) on all endpoints
- [ ] Parameterized queries (Prisma handles this)
- [ ] XSS protection (escape output, CSP headers)
- [ ] Secure headers (helmet)
- [ ] Webhook signature verification (Midtrans)
- [ ] Audit logging on critical actions
- [ ] Server-side price calculation
- [ ] Server-side stock validation
- [ ] Secrets only in backend `.env`
- [ ] No secrets in frontend bundle

---

## 19. Deployment

### 19.1 Build

- Frontend: `vite build` → static files served by backend or CDN
- Backend: `tsc` → Node.js server
- Prisma: `prisma migrate deploy` on startup

### 19.2 Environment Variables

All secrets in backend `.env`:
```
DATABASE_URL=          # PostgreSQL/Neon connection
MIDTRANS_SERVER_KEY=   # Midtrans server key
MIDTRANS_CLIENT_KEY=   # Midtrans client key
MIDTRANS_MERCHANT_ID=  # Midtrans merchant ID
RAJAONGKIR_API_KEY=    # RajaOngkir API key
AUTH_SECRET=           # Session secret
APP_URL=               # Frontend URL
API_URL=               # Backend URL
INITIAL_ADMIN_EMAIL=   # Bootstrap admin email
INITIAL_ADMIN_PASSWORD= # Bootstrap admin password (hashed before storage)
```

---

## 20. Implementation Order

Based on dependency graph:

```
1. Project setup (Vite, Express, Prisma, Tailwind)
2. Database schema + migrations
3. Auth (login, session, RBAC)
4. Admin: Users, Categories, Form Builder
5. Publisher: Products (dynamic forms)
6. Product Approval flow
7. Storefront: Public products, categories
8. Cart
9. Checkout + Order splitting
10. Payment (Midtrans)
11. Shipping (RajaOngkir)
12. Publisher Orders + AWB
13. Notifications
14. Reviews
15. Reports
16. Audit logs
17. SEO + Responsive polish
18. Testing
19. Production build
20. Final audit against SDOT
```

---

## 21. Acceptance Criteria

All acceptance criteria from SDOT section 99 and 105 apply. This design does not add new business requirements — it defines how to implement the existing ones.

---

**END OF DESIGN SPEC**
