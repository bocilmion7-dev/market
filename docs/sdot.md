SDOT FINAL

MARKETPLACE

SINGLE DOCUMENT OF TRUTH

Version 1.0.0 — FINAL

---

1. PROJECT IDENTITY

Project Name: Marketplace
Project Folder: "marketplace"
Application: Web Marketplace
Business Model: Single Marketplace with Internal Product Publishers
Product Type: Physical Goods

Technology Stack

- React
- Vite
- TypeScript
- Node.js
- PostgreSQL
- Neon PostgreSQL
- Midtrans
- RajaOngkir

Architecture:

Browser
   │
   ▼
React + Vite
   │
   ▼
Backend API
   │
   ├── PostgreSQL / Neon
   ├── Midtrans
   └── RajaOngkir

Frontend DILARANG mengakses PostgreSQL secara langsung.

---

2. PURPOSE

Marketplace adalah platform penjualan produk fisik.

Marketplace hanya memiliki satu storefront utama.

Product Publisher bukan pemilik toko.

Product Publisher adalah:

«Penjual/supplier internal Marketplace tanpa storefront/toko sendiri yang bertanggung jawab terhadap produk miliknya dan pemenuhan pesanan yang berasal dari produk tersebut.»

Customer hanya berinteraksi dengan Marketplace.

---

3. ACTORS

3.1 Admin Maker

Admin Maker adalah role dengan permission tertinggi.

Hak:

- Login
- Dashboard
- Membuat user
- Mengelola user
- Mengelola role
- Mengelola Product Publisher
- Mengelola kategori
- Mengelola brand
- Mengelola Category Form Builder
- Mengelola Variant Form Builder
- Melihat seluruh produk
- Approve produk
- Reject produk
- Melihat seluruh order
- Mengelola order bila diperlukan
- Melihat pembayaran
- Melihat shipment
- Melihat laporan penjualan
- Mengelola Admin Fee
- Mengelola settings
- Mengelola review
- Melihat audit log

---

3.2 Product Publisher

Product Publisher adalah seller/supplier internal tanpa toko.

Product Publisher:

- tidak memiliki storefront;
- tidak memiliki toko sendiri;
- tidak memiliki halaman toko publik;
- tidak dapat mengubah tampilan Marketplace;
- hanya dapat melihat produk miliknya sendiri;
- hanya dapat mengelola produk miliknya sendiri;
- menerima notifikasi pesanan;
- hanya dapat melihat pesanan yang berkaitan dengan produknya;
- memproses pesanan;
- melakukan packing;
- menyerahkan barang ke kurir;
- memasukkan AWB;
- melihat status pengiriman.

---

3.3 Customer / Guest

Customer tidak wajib membuat account.

Customer dapat:

- browse;
- search;
- filter;
- melihat kategori;
- melihat product;
- memilih variant;
- cart;
- wishlist browser;
- checkout;
- pembayaran;
- melihat order;
- tracking;
- review.

---

4. CORE BUSINESS MODEL

                    MARKETPLACE
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       CUSTOMER       ADMIN MAKER    PUBLISHER
          │              │              │
          │              │          Products
          │              │          Orders
          │              │          Shipping
          │              │
          ▼              ▼              │
      Storefront      Management        │
          │                             │
          └──────────── Orders ─────────┘

Marketplace hanya mempunyai satu storefront.

Publisher tidak mempunyai storefront.

---

5. USER & ROLE

Roles:

ADMIN_MAKER
PRODUCT_PUBLISHER

Guest tidak membutuhkan role database.

Admin Maker dapat membuat banyak Product Publisher.

Admin Maker dapat:

- create;
- edit;
- activate;
- deactivate;
- suspend;
- assign role.

---

6. PRODUCT OWNERSHIP

Setiap product mempunyai:

publisher_id

Product Publisher hanya boleh mengakses product dengan publisher_id miliknya.

Ownership wajib diperiksa di backend.

Frontend filtering tidak dianggap sebagai security.

---

7. CATEGORY

Category dikelola Admin Maker.

Contoh:

Elektronik
Fashion
Sepatu
Aksesoris

Category bukan hanya label.

Setiap category dapat memiliki:

- Product Form Schema;
- Variant Form Schema.

---

8. CATEGORY FORM BUILDER

Admin Maker dapat membuat form dinamis untuk setiap category.

Menu:

Dashboard
└── Categories
    ├── Category List
    ├── Add Category
    ├── Edit Category
    └── Form Builder

Admin dapat:

- menambah field;
- menghapus field;
- mengubah field;
- drag & drop;
- mengubah urutan;
- menentukan label;
- menentukan field key;
- menentukan field type;
- menentukan required;
- menentukan placeholder;
- menentukan help text;
- menentukan default value;
- menentukan options;
- menentukan validation;
- preview;
- publish schema.

---

9. CATEGORY FIELD TYPES

Minimal:

TEXT
TEXTAREA
NUMBER
DECIMAL
SELECT
MULTI_SELECT
RADIO
CHECKBOX
DATE
BOOLEAN
IMAGE
FILE

Contoh:

Material
Type: SELECT

Options:
- Kulit
- Canvas
- Sintetis

---

10. CATEGORY FORM EXAMPLE

Category:

Sepatu

Schema:

Brand       → SELECT
Material    → SELECT
Gender      → SELECT
Jenis       → SELECT
Deskripsi   → TEXTAREA

Ketika Publisher memilih kategori Sepatu, form tersebut otomatis muncul.

Publisher tidak menentukan struktur form.

---

11. VARIANT FORM BUILDER

Variant juga dibuat menggunakan Form Builder.

Contoh:

Variant Form Builder

Ukuran
Type: SELECT
Options:
36
37
38
39
40
41
42

Warna
Type: SELECT
Options:
Hitam
Putih
Merah

Publisher menggunakan schema tersebut ketika membuat variant.

---

12. VARIANT GENERATION

System dapat menghasilkan kombinasi variant.

Contoh:

Ukuran:
40
41

Warna:
Black
White

Hasil:

40 / Black
40 / White
41 / Black
41 / White

Publisher dapat memilih kombinasi yang tersedia.

Setiap variant:

- unique SKU;
- stock;
- dynamic data;
- Best Price;
- Admin Fee;
- Marketplace Price.

---

13. FORM BUILDER VERSIONING

Schema menggunakan versioning.

Contoh:

Category Form v1
    ↓
Published

Admin edit
    ↓
Category Form v2
    ↓
Draft
    ↓
Publish

v1 dapat di-archive setelah v2 aktif.

Product menyimpan schema version yang digunakannya.

Product lama tidak boleh rusak ketika schema baru dibuat.

---

14. PRODUCT

Product mempunyai:

- publisher;
- category;
- brand;
- name;
- description;
- dynamic category data;
- Best Price;
- Admin Fee;
- Marketplace Price;
- SKU;
- stock;
- variants;
- images;
- status.

---

15. PRODUCT DYNAMIC DATA

Product menyimpan:

category_form_schema_id
category_form_data JSONB

Contoh:

{
  "material": "Kulit",
  "gender": "Pria",
  "jenis": "Sneakers"
}

Backend wajib memvalidasi data terhadap schema.

JSONB tidak berarti data bebas tanpa validasi.

---

16. PRODUCT IMAGES

Maximum:

5 images / product

Upload image ke-6 harus ditolak backend.

Image:

- URL/path;
- alt text;
- sort order.

---

17. SKU

SKU dibuat otomatis oleh backend.

Publisher tidak memasukkan final SKU secara manual.

SKU harus unique.

Variant juga mempunyai unique SKU.

---

18. PRODUCT VARIANT

Variant memiliki:

- product_id;
- variant schema;
- dynamic variant data;
- SKU;
- Best Price;
- Marketplace Price;
- stock;
- status.

Variant data:

variant_form_schema_id
variant_form_data JSONB

Contoh:

{
  "size": "40",
  "color": "Black"
}

---

19. VARIANT PRICE

Default:

variant Best Price = product Best Price

Variant dapat mempunyai price override.

Jika ada override:

variant Best Price = variant price override

Marketplace Price dihitung dari Best Price yang berlaku.

---

20. PRODUCT STATUS

DRAFT
PENDING_APPROVAL
PUBLISHED
REJECTED
UNPUBLISHED
ARCHIVED

Hanya:

PUBLISHED

yang terlihat customer.

---

21. PRODUCT APPROVAL

Workflow:

DRAFT
  ↓
PENDING_APPROVAL
  ↓
 ┌───────────────┐
 │               │
 ▼               ▼
APPROVED       REJECTED
 │
 ▼
PUBLISHED

Reject wajib mempunyai reason/note.

---

22. PUBLISHED PRODUCT EDIT

Jika Publisher mengubah product Published:

PUBLISHED
    ↓
EDIT
    ↓
PENDING_APPROVAL

Product langsung tidak tampil di Marketplace.

Old version tidak tetap live.

Setelah approve:

PENDING_APPROVAL
    ↓
PUBLISHED

---

23. ADMIN FEE

Admin Fee dikonfigurasi Admin Maker.

Menu:

Settings
└── Admin Fee

Percentage.

Formula:

Admin Fee Amount =
Best Price × Admin Fee Percentage / 100

Marketplace Price =
Best Price + Admin Fee Amount

Contoh:

Best Price = Rp100.000
Admin Fee = 10%

Admin Fee = Rp10.000
Marketplace Price = Rp110.000

---

24. CUSTOMER PRICE

Customer hanya melihat:

Marketplace Price

Best Price adalah internal.

---

25. PROFIT

Formula:

Profit =
Marketplace Price - Best Price

Quantity:

Profit =
(Marketplace Price - Best Price) × Quantity

Shipping tidak termasuk profit.

---

26. PRICE SNAPSHOT

Ketika order dibuat, simpan:

best_price_snapshot
admin_fee_percentage_snapshot
admin_fee_amount_snapshot
marketplace_price_snapshot
quantity
subtotal_best_price
subtotal_marketplace_price
profit

Harga order lama tidak berubah ketika product berubah.

---

27. CART

Guest memiliki cart.

Cart boleh berisi produk dari beberapa Publisher.

Business rule:

1 ORDER = 1 PRODUCT PUBLISHER

Maka checkout menggunakan automatic splitting.

---

28. MULTI-PUBLISHER CART

Contoh:

Cart

Publisher A
- Product A
- Product B

Publisher B
- Product C

Checkout menghasilkan:

Order A
Publisher A
Product A
Product B

Order B
Publisher B
Product C

Customer tetap menggunakan satu checkout flow.

---

29. CHECKOUT

Workflow:

Cart
 ↓
Validate Product
 ↓
Validate Published Status
 ↓
Validate Variant
 ↓
Validate Stock
 ↓
Validate Price
 ↓
Group by Publisher
 ↓
Create Order(s)
 ↓
Calculate Shipping
 ↓
Create Payment
 ↓
Midtrans

Backend adalah sumber kebenaran.

---

30. CUSTOMER

Guest checkout membutuhkan:

- name;
- email;
- phone;
- recipient name;
- shipping address;
- province;
- city/regency;
- district/kecamatan;
- postal code.

---

31. ORDER LOOKUP

Customer tanpa login dapat mengecek order.

Gunakan kombinasi:

Order Number
+
Email / Phone
+
Verification

Endpoint wajib rate limited.

Order number saja tidak boleh cukup untuk mengambil data sensitif.

---

32. SHIPPING

Provider:

RajaOngkir

Shipping origin:

Product Publisher address

Origin mempunyai:

- province;
- city;
- district;
- postal code;
- address.

Destination berasal dari customer.

---

33. SHIPPING CALCULATION

Publisher Origin
+
Customer Destination
+
Weight
 ↓
RajaOngkir
 ↓
Courier
 ↓
Service
 ↓
Shipping Cost

Customer membayar ongkir.

Ongkir tidak menjadi profit.

---

34. MANUAL COURIER

Marketplace tidak melakukan automatic shipment booking.

Publisher:

PAID
 ↓
PROCESSING
 ↓
PACKED
 ↓
Hand to Courier
 ↓
Receive AWB
 ↓
Input AWB
 ↓
SHIPPED

---

35. AWB

AWB diinput oleh:

PRODUCT_PUBLISHER

Publisher hanya boleh input AWB untuk order miliknya.

AWB:

- courier;
- service;
- AWB;
- shipped_at;
- status.

---

36. ORDER STATUS

PENDING_PAYMENT
PAID
PROCESSING
PACKED
SHIPPED
DELIVERED
COMPLETED
CANCELLED
REFUNDED
PAYMENT_FAILED
PAYMENT_EXPIRED

Normal flow:

PENDING_PAYMENT
 ↓
PAID
 ↓
PROCESSING
 ↓
PACKED
 ↓
SHIPPED
 ↓
DELIVERED
 ↓
COMPLETED

---

37. PRODUCT PUBLISHER PESANAN

Publisher memiliki menu:

Dashboard
Produk Saya
Pesanan
Notifikasi
Profil

Pesanan hanya miliknya.

---

38. PUBLISHER ORDER NOTIFICATION

Ketika payment menjadi PAID:

PAID
 ↓
Publisher Notification

Notification minimal:

- order number;
- date;
- item count;
- status.

---

39. PUBLISHER ORDER MANAGEMENT

Menu:

Pesanan
├── Semua
├── Pesanan Baru
├── Diproses
├── Dikemas
├── Dikirim
└── Selesai

Publisher dapat:

- melihat detail;
- memproses;
- packing;
- input AWB;
- melihat tracking.

---

40. PUBLISHER ORDER OWNERSHIP

Publisher A:

Order A → ALLOWED
Order B → FORBIDDEN

Backend harus memeriksa:

order.publisher_id

terhadap authenticated publisher.

---

41. PAYMENT

Provider:

Midtrans

Flow:

Checkout
 ↓
Create Order
 ↓
Create Midtrans Transaction
 ↓
Customer Pay
 ↓
Midtrans Webhook
 ↓
Server Verification
 ↓
PAID

Frontend tidak menentukan payment status.

---

42. PAYMENT STATUS

PENDING
PAID
FAILED
EXPIRED
CANCELLED
REFUNDED

Webhook wajib idempotent.

---

43. STOCK

Backend wajib memastikan:

requested quantity <= available stock

Stock tidak boleh minus.

Gunakan database transaction/locking untuk mencegah overselling.

Payment failed/expired harus me-release reservation bila menggunakan stock reservation.

---

44. REVIEW

Customer hanya dapat review product yang dibeli.

Recommended condition:

Order = COMPLETED

Review terhubung ke:

product
order
order_item

Rating:

1–5

Satu order item hanya dapat memiliki satu review dari customer.

---

45. WISHLIST

Wishlist menggunakan:

Browser localStorage/cache

Tidak membutuhkan account.

Tidak disimpan sebagai PostgreSQL wishlist.

---

46. SALES REPORT

Admin Maker:

Dashboard
└── Laporan Penjualan

Filter:

- Today;
- Yesterday;
- Last 7 Days;
- Last 30 Days;
- This Month;
- Last Month;
- Custom Date Range;
- All Publisher;
- Selected Publisher.

---

47. SALES REPORT METRICS

Tampilkan:

Total Best Price
Total Marketplace Price
Profit
Total Products Sold
Total Orders

Formula:

Total Best Price =
SUM(best_price_snapshot × quantity)

Total Marketplace Price =
SUM(marketplace_price_snapshot × quantity)

Profit =
Total Marketplace Price - Total Best Price

Shipping tidak dihitung.

---

48. SALES REPORT DETAIL

Order:

- order number;
- date;
- order status;
- payment status;
- shipping status.

Publisher:

- full name;
- phone;
- address;
- district.

Customer:

- name;
- email;
- phone;
- shipping address.

Product:

- product;
- SKU;
- variant;
- quantity;
- Best Price;
- Marketplace Price;
- subtotal Best Price;
- subtotal Marketplace Price;
- profit.

Payment:

- method;
- status;
- paid_at.

Shipping:

- courier;
- service;
- shipping cost;
- AWB;
- status.

---

49. ADMIN DASHBOARD

Minimal:

- total products;
- pending approval;
- publishers;
- orders;
- pending payment;
- paid;
- processing;
- shipped;
- completed;
- sales;
- profit.

---

50. PUBLISHER DASHBOARD

Hanya data Publisher sendiri:

- total products;
- Published;
- Pending Approval;
- Rejected;
- New Orders;
- Processing;
- Packed;
- Shipped;
- Completed.

---

51. ADMIN MENU

Dashboard
Users
Product Publishers
Categories
Brands
Products
Orders
Payments
Shipments
Laporan Penjualan
Settings
Audit Logs
Reviews

---

52. PUBLISHER MENU

Dashboard
Produk Saya
Pesanan
Notifikasi
Profil

---

53. CUSTOMER STOREFRONT

Home
Products
Categories
Search
Product Detail
Cart
Checkout
Payment
Order Result
Order Tracking
Review

---

54. DATABASE

Database:

PostgreSQL
Neon

Frontend tidak direct database access.

---

55. DATABASE TABLES

users

id UUID PK
email VARCHAR(255) UNIQUE NOT NULL
password_hash TEXT NOT NULL
full_name VARCHAR(150) NOT NULL
phone VARCHAR(30)
status VARCHAR(30) NOT NULL
last_login_at TIMESTAMP
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

roles

id UUID PK
name VARCHAR(50) UNIQUE NOT NULL
description TEXT
created_at TIMESTAMP NOT NULL

---

user_roles

user_id UUID FK users
role_id UUID FK roles
created_at TIMESTAMP NOT NULL

PK(user_id, role_id)

---

publisher_profiles

id UUID PK
user_id UUID UNIQUE FK users
full_name VARCHAR(150) NOT NULL
phone VARCHAR(30) NOT NULL
address TEXT NOT NULL
province_id VARCHAR(50) NOT NULL
city_id VARCHAR(50) NOT NULL
district_id VARCHAR(50) NOT NULL
postal_code VARCHAR(10)
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

categories

id UUID PK
name VARCHAR(150) UNIQUE NOT NULL
slug VARCHAR(180) UNIQUE NOT NULL
description TEXT
status VARCHAR(30) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

category_form_schemas

id UUID PK
category_id UUID FK categories
version INTEGER NOT NULL
status VARCHAR(30) NOT NULL
created_by UUID FK users
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

category_form_fields

id UUID PK
schema_id UUID FK category_form_schemas
field_key VARCHAR(100) NOT NULL
label VARCHAR(150) NOT NULL
field_type VARCHAR(50) NOT NULL
required BOOLEAN NOT NULL
placeholder VARCHAR(255)
help_text TEXT
default_value JSONB
options JSONB
validation_rules JSONB
sort_order INTEGER NOT NULL
status VARCHAR(30) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

Constraint:

UNIQUE(schema_id, field_key)

---

variant_form_schemas

id UUID PK
category_id UUID FK categories
version INTEGER NOT NULL
status VARCHAR(30) NOT NULL
created_by UUID FK users
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

variant_form_fields

id UUID PK
schema_id UUID FK variant_form_schemas
field_key VARCHAR(100) NOT NULL
label VARCHAR(150) NOT NULL
field_type VARCHAR(50) NOT NULL
required BOOLEAN NOT NULL
options JSONB
validation_rules JSONB
sort_order INTEGER NOT NULL
status VARCHAR(30) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

Constraint:

UNIQUE(schema_id, field_key)

---

brands

id UUID PK
name VARCHAR(150) UNIQUE NOT NULL
slug VARCHAR(180) UNIQUE NOT NULL
status VARCHAR(30) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

products

id UUID PK
publisher_id UUID FK publisher_profiles
category_id UUID FK categories
brand_id UUID FK brands
category_form_schema_id UUID FK category_form_schemas
name VARCHAR(255) NOT NULL
slug VARCHAR(280) UNIQUE NOT NULL
description TEXT NOT NULL
category_form_data JSONB NOT NULL
best_price NUMERIC(18,2) NOT NULL
admin_fee_percentage NUMERIC(8,4) NOT NULL
admin_fee_amount NUMERIC(18,2) NOT NULL
marketplace_price NUMERIC(18,2) NOT NULL
sku VARCHAR(100) UNIQUE NOT NULL
stock INTEGER NOT NULL
has_variants BOOLEAN NOT NULL
status VARCHAR(40) NOT NULL
rejection_reason TEXT
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

product_variants

id UUID PK
product_id UUID FK products
variant_form_schema_id UUID FK variant_form_schemas
variant_form_data JSONB NOT NULL
sku VARCHAR(100) UNIQUE NOT NULL
best_price NUMERIC(18,2) NOT NULL
admin_fee_percentage NUMERIC(8,4) NOT NULL
admin_fee_amount NUMERIC(18,2) NOT NULL
marketplace_price NUMERIC(18,2) NOT NULL
stock INTEGER NOT NULL
status VARCHAR(30) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

product_media

id UUID PK
product_id UUID FK products
url TEXT NOT NULL
alt_text VARCHAR(255)
sort_order INTEGER NOT NULL
created_at TIMESTAMP NOT NULL

Maximum 5 per product.

---

product_approval_history

id UUID PK
product_id UUID FK products
reviewer_id UUID FK users
action VARCHAR(30) NOT NULL
note TEXT
created_at TIMESTAMP NOT NULL

---

customers

id UUID PK
name VARCHAR(150) NOT NULL
email VARCHAR(255) NOT NULL
phone VARCHAR(30) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

customer_addresses

id UUID PK
customer_id UUID FK customers
recipient_name VARCHAR(150) NOT NULL
phone VARCHAR(30) NOT NULL
address TEXT NOT NULL
province_id VARCHAR(50) NOT NULL
city_id VARCHAR(50) NOT NULL
district_id VARCHAR(50) NOT NULL
postal_code VARCHAR(10) NOT NULL
created_at TIMESTAMP NOT NULL

---

carts

id UUID PK
session_id VARCHAR(255) UNIQUE NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

cart_items

id UUID PK
cart_id UUID FK carts
product_id UUID FK products
variant_id UUID FK product_variants
quantity INTEGER NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

checkout_sessions

Digunakan untuk menghubungkan satu checkout customer dengan beberapa order.

id UUID PK
session_reference VARCHAR(100) UNIQUE NOT NULL
customer_id UUID FK customers
subtotal_marketplace_price NUMERIC(18,2) NOT NULL
shipping_total NUMERIC(18,2) NOT NULL
grand_total NUMERIC(18,2) NOT NULL
status VARCHAR(40) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

orders

id UUID PK
checkout_session_id UUID FK checkout_sessions
order_number VARCHAR(50) UNIQUE NOT NULL
publisher_id UUID FK publisher_profiles
customer_id UUID FK customers
shipping_address_id UUID FK customer_addresses
subtotal_best_price NUMERIC(18,2) NOT NULL
subtotal_marketplace_price NUMERIC(18,2) NOT NULL
shipping_cost NUMERIC(18,2) NOT NULL
grand_total NUMERIC(18,2) NOT NULL
order_status VARCHAR(40) NOT NULL
payment_status VARCHAR(40) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

Business constraint:

1 order = 1 publisher

---

order_items

id UUID PK
order_id UUID FK orders
product_id UUID FK products
variant_id UUID FK product_variants

product_name_snapshot VARCHAR(255) NOT NULL
sku_snapshot VARCHAR(100) NOT NULL
variant_snapshot VARCHAR(255)

best_price_snapshot NUMERIC(18,2) NOT NULL
admin_fee_percentage_snapshot NUMERIC(8,4) NOT NULL
admin_fee_amount_snapshot NUMERIC(18,2) NOT NULL
marketplace_price_snapshot NUMERIC(18,2) NOT NULL

quantity INTEGER NOT NULL

subtotal_best_price NUMERIC(18,2) NOT NULL
subtotal_marketplace_price NUMERIC(18,2) NOT NULL
profit NUMERIC(18,2) NOT NULL

created_at TIMESTAMP NOT NULL

---

payments

id UUID PK
checkout_session_id UUID FK checkout_sessions
order_id UUID FK orders
provider VARCHAR(50) NOT NULL
provider_transaction_id VARCHAR(255) UNIQUE
payment_reference VARCHAR(255)
payment_method VARCHAR(100)
amount NUMERIC(18,2) NOT NULL
status VARCHAR(40) NOT NULL
paid_at TIMESTAMP
expired_at TIMESTAMP
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

payment_transactions

id UUID PK
payment_id UUID FK payments
provider_event_id VARCHAR(255)
event_type VARCHAR(100) NOT NULL
payload JSONB NOT NULL
processed BOOLEAN NOT NULL
processed_at TIMESTAMP
created_at TIMESTAMP NOT NULL

---

shipments

id UUID PK
order_id UUID UNIQUE FK orders
publisher_id UUID FK publisher_profiles
courier VARCHAR(100) NOT NULL
service VARCHAR(100) NOT NULL
shipping_cost NUMERIC(18,2) NOT NULL
weight_gram INTEGER NOT NULL
awb VARCHAR(150)
status VARCHAR(40) NOT NULL
shipped_at TIMESTAMP
delivered_at TIMESTAMP
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

shipping_tracking

id UUID PK
shipment_id UUID FK shipments
status VARCHAR(100) NOT NULL
description TEXT
location VARCHAR(255)
event_time TIMESTAMP NOT NULL
created_at TIMESTAMP NOT NULL

---

notifications

id UUID PK
user_id UUID FK users
type VARCHAR(100) NOT NULL
title VARCHAR(255) NOT NULL
message TEXT NOT NULL
reference_type VARCHAR(100)
reference_id UUID
read_at TIMESTAMP
created_at TIMESTAMP NOT NULL

---

reviews

id UUID PK
product_id UUID FK products
order_id UUID FK orders
order_item_id UUID FK order_items
rating INTEGER NOT NULL
review_text TEXT
customer_name VARCHAR(150) NOT NULL
status VARCHAR(30) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

audit_logs

id UUID PK
actor_user_id UUID FK users
action VARCHAR(100) NOT NULL
entity_type VARCHAR(100) NOT NULL
entity_id UUID
old_data JSONB
new_data JSONB
ip_address INET
user_agent TEXT
created_at TIMESTAMP NOT NULL

---

settings

id UUID PK
key VARCHAR(100) UNIQUE NOT NULL
value JSONB NOT NULL
updated_by UUID FK users
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL

---

56. DATABASE RELATIONSHIP

users
 │
 ├── user_roles ── roles
 │
 └── publisher_profiles
          │
          ▼
       products
          │
          ├── product_media
          ├── product_variants
          └── product_approval_history
          
categories
 │
 ├── category_form_schemas
 │      └── category_form_fields
 │
 └── variant_form_schemas
        └── variant_form_fields

customers
 │
 └── customer_addresses
        │
        ▼
checkout_sessions
        │
        ├── orders
        │     │
        │     ├── order_items
        │     └── shipments
        │             └── shipping_tracking
        │
        └── payments
               └── payment_transactions

---

57. API ARCHITECTURE

Base:

/api

Response:

{
  "success": true,
  "data": {},
  "message": "..."
}

Error:

{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "..."
  }
}

---

58. AUTH API

POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/refresh

---

59. ADMIN USER API

GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id
DELETE /api/admin/users/:id
PATCH  /api/admin/users/:id/roles
PATCH  /api/admin/users/:id/status

---

60. CATEGORY API

GET   /api/admin/categories
POST  /api/admin/categories
GET   /api/admin/categories/:id
PATCH /api/admin/categories/:id
DELETE /api/admin/categories/:id

---

61. CATEGORY FORM BUILDER API

GET   /api/admin/categories/:id/form-schema
POST  /api/admin/categories/:id/form-schema
PATCH /api/admin/categories/:id/form-schema
POST  /api/admin/categories/:id/form-schema/publish

---

62. VARIANT FORM BUILDER API

GET   /api/admin/categories/:id/variant-schema
POST  /api/admin/categories/:id/variant-schema
PATCH /api/admin/categories/:id/variant-schema
POST  /api/admin/categories/:id/variant-schema/publish

---

63. PUBLISHER CATEGORY SCHEMA API

GET /api/publisher/categories/:id/form-schema
GET /api/publisher/categories/:id/variant-schema

Publisher hanya membaca schema Published.

---

64. PUBLISHER PRODUCT API

GET   /api/publisher/products
POST  /api/publisher/products
GET   /api/publisher/products/:id
PATCH /api/publisher/products/:id
POST  /api/publisher/products/:id/submit

Ownership wajib diperiksa.

---

65. ADMIN PRODUCT API

GET  /api/admin/products
GET  /api/admin/products/:id

POST /api/admin/products/:id/approve
POST /api/admin/products/:id/reject
POST /api/admin/products/:id/unpublish
POST /api/admin/products/:id/archive

GET /api/admin/products/:id/approval-history

---

66. PUBLIC PRODUCT API

GET /api/products
GET /api/products/:slug
GET /api/categories
GET /api/categories/:slug
GET /api/brands

Public API hanya mengembalikan:

status = PUBLISHED

---

67. CART API

GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:id
DELETE /api/cart/items/:id
DELETE /api/cart

---

68. CHECKOUT API

POST /api/checkout/validate
POST /api/checkout/shipping-options
POST /api/checkout
GET  /api/checkout/:id

---

69. ORDER API

Customer:

GET /api/orders/:orderNumber
POST /api/orders/:orderNumber/verify

Admin:

GET   /api/admin/orders
GET   /api/admin/orders/:id
PATCH /api/admin/orders/:id/status

Publisher:

GET   /api/publisher/orders
GET   /api/publisher/orders/:id
PATCH /api/publisher/orders/:id/status
POST  /api/publisher/orders/:id/awb

---

70. PAYMENT API

POST /api/payments/create
GET  /api/payments/:id
POST /api/payments/midtrans/notification

---

71. SHIPPING API

GET  /api/shipping/provinces
GET  /api/shipping/cities
GET  /api/shipping/districts
POST /api/shipping/cost
GET  /api/shipments/:id
GET  /api/shipments/:id/tracking

---

72. REPORT API

GET /api/admin/reports/sales
GET /api/admin/reports/sales/:orderId

Parameters:

from
to
publisher_id

---

73. NOTIFICATION API

GET  /api/notifications
PATCH /api/notifications/:id/read
POST /api/notifications/read-all

---

74. REVIEW API

POST /api/reviews
GET  /api/products/:productId/reviews
PATCH /api/admin/reviews/:id/status

---

75. SETTINGS API

GET   /api/admin/settings
GET   /api/admin/settings/admin-fee
PATCH /api/admin/settings/admin-fee

---

76. AUTHORIZATION

Backend middleware:

authenticate()
authorize(role)
authorizePublisherOwnership()

Publisher ownership:

authenticatedPublisher.id
==
resource.publisher_id

Jika tidak:

403 Forbidden

---

77. SECURITY

WAJIB:

- password hashing;
- secure authentication;
- secure cookies/session;
- RBAC;
- ownership checks;
- input validation;
- SQL injection protection;
- parameterized queries;
- XSS protection;
- CSRF protection jika applicable;
- CORS restriction;
- rate limiting;
- secure headers;
- webhook verification;
- audit logging;
- server-side price calculation;
- server-side stock validation;
- secrets server-side.

---

78. PAYMENT SECURITY

Midtrans secret key hanya backend.

Webhook:

Receive
 ↓
Verify
 ↓
Validate amount
 ↓
Validate reference
 ↓
Idempotency check
 ↓
Process
 ↓
Record event

Duplicate webhook tidak boleh membuat duplicate order/payment processing.

---

79. DATABASE SECURITY

Gunakan:

- parameterized SQL;
- foreign keys;
- constraints;
- transactions;
- indexes;
- connection pooling.

Currency:

NUMERIC(18,2)

Jangan gunakan floating-point untuk currency.

---

80. ENVIRONMENT VARIABLES

DATABASE_URL=

MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_MERCHANT_ID=

RAJAONGKIR_API_KEY=

AUTH_SECRET=

APP_URL=
API_URL=

Secret tidak boleh masuk frontend bundle.

---

81. INITIAL ADMIN

Support bootstrap:

INITIAL_ADMIN_EMAIL
INITIAL_ADMIN_PASSWORD

Password harus di-hash.

Jangan hardcode production credentials di source code.

---

82. AUDIT LOG

Audit minimal:

Login
User Creation
Role Change
Product Creation
Product Update
Product Submission
Product Approval
Product Rejection
Product Unpublish
Product Archive
Category Schema Change
Variant Schema Change
Admin Fee Change
Order Status Change
AWB Change
Payment Webhook
Refund

---

83. UI/UX VISUAL

Visual direction:

Black = dominant
Dark Gray = secondary
White / Light Gray = surface
Orange = accent

Style:

- bold;
- premium;
- clean;
- modern;
- professional.

Jangan menyalin logo, font, asset, atau identitas brand pihak lain.

---

84. CUSTOMER STOREFRONT

Home:

Header
Search
Navigation
Hero
Categories
Featured Products
Products
Footer

Product card:

- image;
- product name;
- brand;
- Marketplace Price;
- rating;
- stock.

Best Price tidak ditampilkan.

---

85. PRODUCT DETAIL

Menampilkan:

- gallery;
- product name;
- brand;
- Marketplace Price;
- dynamic category attributes;
- variant selector;
- stock;
- description;
- Add to Cart;
- checkout;
- reviews.

---

86. DYNAMIC PRODUCT FORM

Publisher:

Tambah Produk
 ↓
Pilih Category
 ↓
Load Category Schema
 ↓
Render Dynamic Form
 ↓
Isi Data
 ↓
Load Variant Schema
 ↓
Create Variants
 ↓
Set Stock
 ↓
Set Best Price
 ↓
Save Draft

---

87. ADMIN FORM BUILDER UI

Admin:

Category
 ↓
Form Builder
 ↓
Add Field
 ↓
Field Type
 ↓
Label
 ↓
Field Key
 ↓
Required
 ↓
Options
 ↓
Validation
 ↓
Drag & Drop
 ↓
Preview
 ↓
Publish

---

88. PUBLISHER PRODUCT PAGE

Produk Saya

Hanya produk milik Publisher.

Kolom:

Product
SKU
Category
Marketplace Price
Stock
Status
Updated
Action

---

89. PUBLISHER ORDER PAGE

Menampilkan:

Order Number
Date
Customer
Items
Payment Status
Order Status
Courier
AWB
Action

Hanya order milik Publisher.

---

90. ADMIN APPROVAL PAGE

Pending Approval

Admin melihat:

- product;
- images;
- category;
- dynamic attributes;
- variants;
- price;
- stock;
- publisher.

Action:

Approve
Reject

Reject wajib reason.

---

91. RESPONSIVE

Support:

Mobile
Tablet
Desktop

Mobile-first.

---

92. ACCESSIBILITY

Minimal:

- semantic HTML;
- labels;
- keyboard navigation;
- focus states;
- contrast;
- alt text;
- accessible dialog;
- accessible errors.

---

93. SEO

Public storefront:

- semantic HTML;
- title;
- description;
- canonical;
- Open Graph;
- product structured data;
- category metadata;
- sitemap;
- robots;
- clean slug.

Only Published products masuk sitemap.

---

94. PERFORMANCE

Implement:

- pagination;
- indexes;
- lazy images;
- optimized images;
- API pagination;
- caching where appropriate;
- avoid N+1 queries;
- connection pooling.

---

95. DATABASE MIGRATION

Database schema wajib menggunakan migration.

Migration harus:

- versioned;
- reproducible;
- deterministic.

Jangan membuat schema production secara manual tanpa migration.

---

96. STOCK TRANSACTION

Checkout harus menggunakan transaction.

Concept:

BEGIN
 ↓
Validate Product
 ↓
Validate Price
 ↓
Validate Stock
 ↓
Reserve Stock
 ↓
Create Order
 ↓
Create Order Items
 ↓
Create Shipment
 ↓
Create Payment
 ↓
COMMIT

Failure:

ROLLBACK

---

97. ERROR CODES

Minimal:

AUTH_REQUIRED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
PRODUCT_NOT_AVAILABLE
PRODUCT_NOT_PUBLISHED
INSUFFICIENT_STOCK
PRICE_CHANGED
INVALID_VARIANT
CHECKOUT_FAILED
PAYMENT_FAILED
PAYMENT_EXPIRED
PAYMENT_VERIFICATION_FAILED
INVALID_WEBHOOK
SHIPMENT_NOT_FOUND
AWB_REQUIRED
INVALID_ORDER_STATUS
OWNERSHIP_FORBIDDEN
RATE_LIMITED
INTERNAL_ERROR

---

98. TESTING

Unit Test

Wajib:

- Admin Fee;
- Marketplace Price;
- Profit;
- variant price;
- stock;
- checkout;
- order split;
- status transitions;
- dynamic form validation.

Integration Test

Wajib:

- login;
- RBAC;
- publisher ownership;
- product CRUD;
- category form builder;
- variant form builder;
- approval;
- checkout;
- Midtrans webhook;
- RajaOngkir;
- AWB;
- report.

E2E

Minimal:

Publisher Login
 ↓
Create Product
 ↓
Submit
 ↓
Admin Approve
 ↓
Customer Purchase
 ↓
Payment
 ↓
Publisher Notification
 ↓
Publisher Process
 ↓
Publisher Input AWB
 ↓
Customer Tracking
 ↓
Completed
 ↓
Review

---

99. CRITICAL ACCEPTANCE TESTS

Product Ownership

Publisher A tidak boleh mengakses Publisher B.

Expected:

403

---

Approval

DRAFT
→ PENDING_APPROVAL
→ PUBLISHED

---

Reject

PENDING_APPROVAL
→ REJECTED

Reason wajib.

---

Published Edit

PUBLISHED
→ PENDING_APPROVAL

Product tidak tampil di storefront.

---

Admin Fee

Best Price = 100000
Fee = 10%

Marketplace Price = 110000
Profit = 10000

---

Shipping

Marketplace Price = 120000
Best Price = 100000
Shipping = 20000

Customer pays = 140000
Profit = 20000

---

Multi Publisher

A + A + B

Expected:

Order A
Order B

---

AWB

Publisher A:

Order A → Allowed
Order B → Forbidden

---

100. COMPLETE PRODUCT WORKFLOW

Admin creates Category
 ↓
Admin builds Category Form
 ↓
Admin builds Variant Form
 ↓
Publish Schema
 ↓
Publisher Login
 ↓
Produk Saya
 ↓
Tambah Produk
 ↓
Select Category
 ↓
Dynamic Product Form
 ↓
Dynamic Variant Form
 ↓
Input Product Data
 ↓
Upload ≤5 Images
 ↓
Set Best Price
 ↓
Set Stock
 ↓
Save DRAFT
 ↓
Submit
 ↓
PENDING_APPROVAL
 ↓
Admin Review
 ├── Reject
 │     ↓
 │  REJECTED
 │     ↓
 │  Edit
 │     ↓
 │  Submit
 │
 └── Approve
       ↓
    PUBLISHED
       ↓
Customer sees Product

---

101. COMPLETE ORDER WORKFLOW

Customer
 ↓
Browse
 ↓
Product Detail
 ↓
Select Variant
 ↓
Cart
 ↓
Checkout
 ↓
Backend Validation
 ↓
Group by Publisher
 ↓
Create Order per Publisher
 ↓
Shipping Calculation
 ↓
Midtrans
 ↓
Customer Payment
 ↓
Midtrans Webhook
 ↓
Server Verification
 ↓
PAID
 ↓
Publisher Notification
 ↓
Publisher Pesanan
 ↓
PROCESSING
 ↓
PACKED
 ↓
Manual Courier Handover
 ↓
Publisher Input AWB
 ↓
SHIPPED
 ↓
Tracking
 ↓
DELIVERED
 ↓
COMPLETED
 ↓
Customer Review

---

102. MULTI-PUBLISHER CHECKOUT

Example:

Publisher A
Product A
Product B

Publisher B
Product C

Result:

Checkout Session
 │
 ├── Order A
 │     ├── Product A
 │     └── Product B
 │
 └── Order B
       └── Product C

Shipping:

Shipment A
Origin = Publisher A

Shipment B
Origin = Publisher B

Customer pays:

Product Total
+
Shipping A
+
Shipping B

Profit:

Product Marketplace Total
-
Product Best Price Total

---

103. PUBLISHER RESPONSIBILITY

Product Publisher bertanggung jawab terhadap:

Product
 ↓
Stock
 ↓
Order
 ↓
Processing
 ↓
Packing
 ↓
Courier Handover
 ↓
AWB

Marketplace bertanggung jawab terhadap:

Storefront
Payment
Platform
Admin
Reporting

---

104. ADMIN RESPONSIBILITY

Admin Maker bertanggung jawab terhadap:

Users
Categories
Form Builders
Brands
Products
Approval
Orders
Payments
Shipping
Reports
Settings
Security
Audit

---

105. DEFINITION OF DONE

Project tidak dianggap selesai hanya karena server dapat berjalan.

Selesai jika seluruh berikut telah bekerja:

React
Vite
TypeScript
Backend
PostgreSQL
Neon
Authentication
RBAC
Admin Maker
Product Publisher
Guest Customer

Category
Category Form Builder
Variant Form Builder
Dynamic Product Form
Dynamic Variant Form
Schema Versioning

Product CRUD
SKU
Images
Stock
Admin Fee
Marketplace Price
Profit
Approval

Cart
Multi Publisher Split
Checkout
Order
Order Snapshot

Midtrans
Payment Webhook
Payment Verification

RajaOngkir
Shipping Calculation
Shipping Tracking
Manual Courier Handover
Manual AWB

Publisher Notifications
Publisher Orders
Publisher Order Processing

Customer Order Lookup
Customer Tracking
Reviews
Wishlist

Sales Report
Audit Logs
Settings
Security
SEO
Accessibility
Responsive UI
Performance

Unit Tests
Integration Tests
E2E Tests
Production Build
Database Migrations

---

106. AI CODING AGENT MASTER RULE

AI coding agent harus membaca dan mengikuti seluruh SDOT ini sebelum implementation.

SDOT adalah Single Source of Truth.

AI agent:

- DILARANG menghilangkan fitur;
- DILARANG menghilangkan workflow;
- DILARANG mengubah business rule;
- DILARANG membuat Publisher menjadi toko;
- DILARANG membuat Publisher melihat produk publisher lain;
- DILARANG membuat Publisher melihat order publisher lain;
- DILARANG membiarkan Publisher approve produknya sendiri;
- DILARANG membiarkan frontend menentukan harga;
- DILARANG mempercayai payment status frontend;
- DILARANG memasukkan shipping sebagai profit;
- DILARANG membuat automatic courier booking;
- DILARANG memindahkan input AWB ke customer;
- DILARANG memindahkan input AWB menjadi proses automatic courier;
- DILARANG membuat field kategori/variant menjadi hardcoded;
- DILARANG melewati Form Builder;
- DILARANG menghilangkan schema versioning;
- DILARANG direct database access dari frontend;
- DILARANG menyimpan secret di frontend;
- DILARANG menggunakan database selain PostgreSQL;
- DILARANG mengganti Midtrans tanpa instruksi;
- DILARANG mengganti RajaOngkir tanpa instruksi;
- DILARANG mengubah struktur bisnis tanpa persetujuan.

AI agent WAJIB:

- membuat database migration;
- membuat API;
- membuat validation;
- membuat RBAC;
- membuat ownership checks;
- membuat transaction;
- membuat error handling;
- membuat audit;
- membuat tests;
- membuat responsive UI;
- membuat production build;
- memastikan seluruh acceptance criteria terpenuhi.

Jika implementasi library/API eksternal memiliki keterbatasan, buat adapter/service layer tanpa mengubah business rule.

---

107. FINAL BUSINESS RULE SUMMARY

MARKETPLACE
= ONE PUBLIC STOREFRONT

PRODUCT PUBLISHER
= SELLER/SUPPLIER WITHOUT STORE

PRODUCT PUBLISHER
= ONLY SEES OWN PRODUCTS

PRODUCT PUBLISHER
= ONLY SEES OWN ORDERS

PRODUCT PUBLISHER
= RECEIVES ORDER NOTIFICATIONS

PRODUCT PUBLISHER
= PROCESSES ORDERS

PRODUCT PUBLISHER
= INPUTS AWB MANUALLY

CATEGORY
= DYNAMIC FORM BUILDER

VARIANT
= DYNAMIC FORM BUILDER

PRODUCT DATA
= DYNAMIC SCHEMA + JSONB

VARIANT DATA
= DYNAMIC SCHEMA + JSONB

ONLY PUBLISHED PRODUCT
= PUBLIC

PUBLISHED EDIT
→ PENDING_APPROVAL
→ PRODUCT HIDDEN

BEST PRICE
= INTERNAL SELLER PRICE

MARKETPLACE PRICE
= BEST PRICE + ADMIN FEE

PROFIT
= MARKETPLACE PRICE - BEST PRICE

SHIPPING
= PAID BY CUSTOMER

SHIPPING
≠ PROFIT

1 ORDER
= 1 PRODUCT PUBLISHER

MULTI-PUBLISHER CART
= AUTOMATIC ORDER SPLITTING

PAYMENT
= MIDTRANS

SHIPPING RATE/TRACKING
= RAJAONGKIR

COURIER BOOKING
= MANUAL

AWB
= INPUT BY PRODUCT PUBLISHER

CUSTOMER
= GUEST CHECKOUT

DATABASE
= POSTGRESQL / NEON

FRONTEND
≠ DIRECT DATABASE ACCESS

---

108. FINAL ARCHITECTURE

                         MARKETPLACE
                              │
                 ┌────────────┴────────────┐
                 │                         │
              STOREFRONT                DASHBOARD
                 │                    ┌────┴────┐
                 │                    │         │
              CUSTOMER            ADMIN       PUBLISHER
                 │                    │         │
                 │                    │         │
                 ▼                    ▼         ▼
              Cart              Management   Products
                 │                           Orders
                 ▼                           Notifications
             Checkout                       Shipping
                 │                           AWB
                 ▼
            Order Split
                 │
          ┌──────┴──────┐
          ▼             ▼
       Order A       Order B
       Pub A         Pub B
          │             │
          ▼             ▼
      Shipment A    Shipment B
          │             │
          └──────┬──────┘
                 ▼
             Midtrans
                 │
                 ▼
            PostgreSQL
                 │
                 ▼
                Neon

---

109. FINAL STATUS

SDOT STATUS: FINAL

Dokumen ini menjadi acuan utama implementation Marketplace.

Semua:

- business rules;
- actors;
- permissions;
- workflows;
- Product Publisher;
- product;
- category;
- Category Form Builder;
- Variant Form Builder;
- dynamic schema;
- database;
- tables;
- fields;
- relationships;
- APIs;
- payment;
- shipping;
- AWB;
- order processing;
- notifications;
- reports;
- security;
- UI/UX;
- testing;
- UAT;
- acceptance criteria

harus mengikuti dokumen ini.

END OF SDOT FINAL
