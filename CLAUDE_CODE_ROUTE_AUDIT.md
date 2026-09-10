# Claude Code Route Audit & Verification Guide

> **Auditor Instructions**: Use this document to audit, test, and verify all 44 Next.js frontend routes, their corresponding backend Express API endpoints (`http://localhost:5000/api/v1`), HTTP methods, payload schemas, and access control guards in the Genekon eCommerce platform.

---

## 1. Quick Environment & Server Check

Run the following commands to confirm both servers are healthy before running route checks:

```bash
# 1. Check backend API health
curl -s http://localhost:5000/api/v1/health

# 2. Check frontend Next.js server
curl -I http://localhost:3000/

# 3. Typecheck both projects
cd backend && npx tsc --noEmit
cd ../frontend && npx tsc --noEmit
```

---

## 2. Complete Route Mapping Matrix

### Group A: Public Catalog & Shopping Routes

| Frontend Route | Associated File | Backend API Endpoint(s) | HTTP Method | Expected Status | Description & Audit Checks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `frontend/src/app/page.tsx` | `GET /cms/banners`<br>`GET /products/featured`<br>`GET /categories` | `GET` | `200` | Homepage. Banners must apply active schedule filtering (`startDate <= now <= endDate`). |
| `/products` | `frontend/src/app/products/page.tsx` | `GET /products` | `GET` | `200` | Product catalog with filters (brand, form, rxRequired, price range). |
| `/product/[id]` | `frontend/src/app/product/[id]/page.tsx` | `GET /products/:idOrSlug` | `GET` | `200 / 404` | Supports UUID or URL-safe slug. Returns product details, images, batches, and related items. |
| `/categories` | `frontend/src/app/categories/page.tsx` | `GET /categories` | `GET` | `200` | Therapeutic categories listing. |
| `/category/[slug]` | `frontend/src/app/category/[slug]/page.tsx` | `GET /products/category/:category`<br>OR `GET /products/category?category=:slug` | `GET` | `200` | Filtered products by category slug. Verify route does not clash with `/:idOrSlug`. |
| `/search` | `frontend/src/app/search/page.tsx` | `GET /products/search?q=:query` | `GET` | `200` | Search by product name, generic molecule name, brand, or category. |
| `/offers` | `frontend/src/app/offers/page.tsx` | `GET /coupons`<br>`GET /cms/banners` | `GET` | `200` | Active promo codes and scheduled offer banners. |
| `/cart` | `frontend/src/app/cart/page.tsx` | `GET /cart`<br>`POST /cart/items`<br>`PUT /cart/items/:id`<br>`DELETE /cart/items/:id`<br>`POST /cart/sync` | Multiple | `200` | Cart operations. Verify `POST /cart/sync` replaces cart state to prevent doubling items. |
| `/checkout` | `frontend/src/app/checkout/page.tsx` | `POST /cart/sync`<br>`POST /coupons/apply`<br>`POST /orders`<br>`POST /payments/create-order`<br>`POST /payments/verify` | `POST` | `200 / 201` | Multi-step checkout. Order placement must calculate coupon discounts authoritatively on backend. |
| `/track-order` | `frontend/src/app/track-order/page.tsx` | `GET /orders/:id` | `GET` | `200 / 404` | Public / authenticated order tracker. Supports both UUID and order numbers (`GNK-*`) without SQL UUID syntax crash. |
| `/prescription/upload` | `frontend/src/app/prescription/upload/page.tsx` | `POST /orders/verify-prescription` | `POST` (multipart) | `200 / 201` | Prescription document upload (JPG, PNG, PDF) using Cloudinary with fail-closed error handling. |
| `/contact` | `frontend/src/app/contact/page.tsx` | Client-side contact / WhatsApp integration | `N/A` | `200` | Static support & dispensary contact page. |
| `/about` | `frontend/src/app/about/page.tsx` | Static content | `N/A` | `200` | Corporate & clinical background. |
| `/terms` | `frontend/src/app/terms/page.tsx` | Static content | `N/A` | `200` | Terms of service. |
| `/privacy-policy` | `frontend/src/app/privacy-policy/page.tsx` | Static content | `N/A` | `200` | Privacy policy & data protection. |
| `/return-policy` | `frontend/src/app/return-policy/page.tsx` | Static content | `N/A` | `200` | Medicine return, cancellation & refund terms. |
| `/shipping-policy` | `frontend/src/app/shipping-policy/page.tsx` | Static content | `N/A` | `200` | Doorstep delivery & cold-chain storage details. |

---

### Group B: Authentication & Onboarding Routes

| Frontend Route | Associated File | Backend API Endpoint(s) | HTTP Method | Expected Status | Description & Audit Checks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/login` | `frontend/src/app/login/page.tsx` | `POST /auth/send-otp`<br>`POST /auth/verify-otp`<br>`POST /auth/login` | `POST` | `200` | Standard customer login. OTP auto-provisioning must strictly assign `CUSTOMER` role. |
| `/signup` | `frontend/src/app/signup/page.tsx` | `POST /auth/register` | `POST` | `201` | Register new customer. Verify schema prohibits `role: "ADMIN"`. |
| `/verify-otp` | `frontend/src/app/verify-otp/page.tsx` | `POST /auth/verify-otp` | `POST` | `200` | Standalone OTP verification page with attempt lockout protection. |
| `/wholesale` | `frontend/src/app/wholesale/page.tsx` | Public wholesale info | `N/A` | `200` | B2B wholesale partner program overview. |
| `/wholesale/register`| `frontend/src/app/wholesale/register/page.tsx` | `POST /auth/register`<br>(Role: `WHOLESALE_PARTNER`) | `POST` | `201` | Submits wholesale partner profile with GST and drug license details for admin review. |

---

### Group C: Customer Account Routes (Auth Guarded)

All routes in `/account/*` require valid JWT Bearer authentication (`authenticateUser`).

| Frontend Route | Associated File | Backend API Endpoint(s) | HTTP Method | Expected Status | Description & Audit Checks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/account` | `frontend/src/app/account/page.tsx` | `GET /users/profile`<br>`GET /orders/my-orders?limit=5` | `GET` | `200` | Account dashboard overview with recent orders. |
| `/account/orders` | `frontend/src/app/account/orders/page.tsx` | `GET /orders/my-orders` | `GET` | `200` | Order history list with pagination and cancellation status. |
| `/account/orders/[id]` | `frontend/src/app/account/orders/[id]/page.tsx` | `GET /orders/:id`<br>`POST /orders/:id/cancel` | `GET`, `POST` | `200` | Single order details with item breakdown and cancellation request submission. |
| `/account/orders/[id]/invoice` | `frontend/src/app/account/orders/[id]/invoice/page.tsx` | `GET /orders/:id` | `GET` | `200` | Printable GST invoice rendering with download option. |
| `/account/prescriptions` | `frontend/src/app/account/prescriptions/page.tsx` | `GET /orders/prescriptions/my-prescriptions` | `GET` | `200` | User prescription vault and pharmacist review status. |
| `/account/addresses` | `frontend/src/app/account/addresses/page.tsx` | `GET /users/addresses`<br>`POST /users/addresses`<br>`PUT /users/addresses/:id`<br>`DELETE /users/addresses/:id` | `GET`, `POST`, `PUT`, `DELETE` | `200 / 201` | Live address management. Changes must persist to PostgreSQL `user_addresses`. |
| `/account/profile` | `frontend/src/app/account/profile/page.tsx` | `GET /users/profile`<br>`PUT /users/profile` | `GET`, `PUT` | `200` | Patient profile updates (name, email, DOB, gender). |
| `/account/notifications` | `frontend/src/app/account/notifications/page.tsx` | Notification center | `GET` | `200` | Order updates and refill reminders. |

---

### Group D: Admin Console Routes (Role Guarded: ADMIN Only)

All routes in `/admin/*` require `authenticateUser` AND `authorizeRole("ADMIN")`.

| Frontend Route | Associated File | Backend API Endpoint(s) | HTTP Method | Expected Status | Description & Audit Checks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/admin` | `frontend/src/app/admin/page.tsx` | Redirects to `/admin/dashboard` | `N/A` | `307 / 200` | Admin entry point. |
| `/admin/login` | `frontend/src/app/admin/login/page.tsx` | `POST /auth/login`<br>`POST /auth/send-otp`<br>`POST /auth/verify-otp` | `POST` | `200` | Admin login page. Verify mock bypass is removed and valid ADMIN credentials are required. |
| `/admin/dashboard` | `frontend/src/app/admin/dashboard/page.tsx` | `GET /admin/dashboard/stats` | `GET` | `200` | Revenue KPIs, customer counts, low stock alerts. Revenue must exclude unpaid orders. |
| `/admin/orders` | `frontend/src/app/admin/orders/page.tsx` | `GET /orders/admin/all` | `GET` | `200` | Paginated admin order list with status filter. |
| `/admin/orders/[id]` | `frontend/src/app/admin/orders/[id]/page.tsx` | `GET /orders/:id`<br>`PUT /orders/admin/:id/status`<br>`PUT /orders/admin/cancellations/:id` | `GET`, `PUT` | `200` | Status change and cancellation approval. Approved cancellation must trigger Razorpay refund. |
| `/admin/products` | `frontend/src/app/admin/products/page.tsx` | `GET /products`<br>`DELETE /products/:id` | `GET`, `DELETE` | `200` | Product catalog overview with stock counts and quick delete. |
| `/admin/products/add` | `frontend/src/app/admin/products/add/page.tsx` | `POST /products`<br>`POST /products/:id/images` | `POST` | `201` | Product creation with category, formulation, and Cloudinary gallery upload. |
| `/admin/products/edit` | `frontend/src/app/admin/products/edit/page.tsx` | `GET /products/:idOrSlug`<br>`PUT /products/:id`<br>`DELETE /products/images/:imageId` | `GET`, `PUT`, `DELETE` | `200` | Edit product pricing, MRP, description, and images. |
| `/admin/prescriptions` | `frontend/src/app/admin/prescriptions/page.tsx` | `GET /orders/admin/prescriptions/pending`<br>`PUT /orders/admin/prescriptions/:id/review` | `GET`, `PUT` | `200` | Review customer prescriptions (Approve / Reject with reason). |
| `/admin/inventory` | `frontend/src/app/admin/inventory/page.tsx` | `GET /inventory/batches`<br>`POST /inventory/batches`<br>`POST /inventory/adjust`<br>`GET /inventory/logs` | `GET`, `POST` | `200 / 201` | Batch management. Adjustments must verify batch belongs to target product ID. Expired batches cannot add sellable stock. |
| `/admin/customers` | `frontend/src/app/admin/customers/page.tsx` | `GET /admin/customers`<br>`GET /admin/customers/:id` | `GET` | `200` | Customer directory, order history, and saved delivery addresses. |
| `/admin/wholesale` | `frontend/src/app/admin/wholesale/page.tsx` | `GET /admin/wholesale/applications`<br>`PUT /admin/wholesale/applications/:id/review` | `GET`, `PUT` | `200` | Wholesale B2B partner applications verification and credit terms approval. |
| `/admin/offers` | `frontend/src/app/admin/offers/page.tsx` | `GET /coupons`<br>`POST /coupons`<br>`PUT /coupons/:id`<br>`DELETE /coupons/:id`<br>`GET /cms/banners`<br>`POST /cms/banners` | Multiple | `200 / 201` | Manage coupon codes and hero promotional banners. |
| `/admin/reports` | `frontend/src/app/admin/reports/page.tsx` | `GET /admin/dashboard/stats` | `GET` | `200` | Financial & fulfillment audit reports. |

---

## 3. High-Priority Route Audit Checks

When auditing, verify these specific high-priority failure modes:

1. **Admin Registration Prevention**:
   - `POST /api/v1/auth/register` with `{"role": "ADMIN", ...}` must return `400 Bad Request`.
2. **Fail-Closed Payment Verification**:
   - `POST /api/v1/payments/verify` with invalid or mismatched `razorpaySignature` must return `400 Bad Request` and never update payment to `PAID`.
3. **Cart Sync Endpoint**:
   - `POST /api/v1/cart/sync` must exist and replace the cart items rather than merging/doubling them.
4. **Order Number / UUID Cast Safety**:
   - `GET /api/v1/orders/GNK-12345` must query `orders.orderNumber` cleanly without triggering PostgreSQL `invalid input syntax for type uuid` error.
5. **Catalog Sub-Route Order**:
   - `GET /api/v1/products/featured`, `GET /api/v1/products/search?q=test`, and `GET /api/v1/products/category/chronic-care` must match their specific routes and NOT fall through to `GET /api/v1/products/:idOrSlug`.
6. **Admin Route HTTP Methods**:
   - `PUT /api/v1/orders/admin/:id/status` and `PUT /api/v1/orders/admin/prescriptions/:id/review` must both succeed (and `PATCH` must also be accepted for compatibility).
7. **Admin Layout Access Control**:
   - Directly navigating to `http://localhost:3000/admin/dashboard` while logged out must show the Admin Sign-In screen and not render sidebar or metric panels.
8. **Live Address Book CRUD**:
   - Adding an address at `http://localhost:3000/account/addresses` must trigger `POST /api/v1/users/addresses` and survive page reload.

---

## 4. Automated Curl Verification Suite

Run this bash snippet in a terminal to verify critical backend endpoints:

```bash
BASE="http://localhost:5000/api/v1"

echo "=== 1. Health Check ==="
curl -s "$BASE/health" | grep -q "status" && echo "PASS: Health check" || echo "FAIL: Health check"

echo "=== 2. Public Catalog Routes ==="
curl -s "$BASE/products" | grep -q "products" && echo "PASS: GET /products" || echo "FAIL: GET /products"
curl -s "$BASE/products/featured" | grep -q "success" && echo "PASS: GET /products/featured" || echo "FAIL: GET /products/featured"
curl -s "$BASE/products/search?q=cold" | grep -q "success" && echo "PASS: GET /products/search" || echo "FAIL: GET /products/search"
curl -s "$BASE/products/category" | grep -q "success" && echo "PASS: GET /products/category" || echo "FAIL: GET /products/category"

echo "=== 3. Public CMS & Coupons ==="
curl -s "$BASE/cms/banners" | grep -q "success" && echo "PASS: GET /cms/banners" || echo "FAIL: GET /cms/banners"
curl -s "$BASE/coupons" | grep -q "success" && echo "PASS: GET /coupons" || echo "FAIL: GET /coupons"

echo "=== 4. Security: Admin Registration Rejection ==="
REGISTER_RES=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacker","phone":"9999999999","role":"ADMIN"}')
echo "$REGISTER_RES" | grep -q -E "Admin registration is not permitted|Invalid enum value" && echo "PASS: Public admin registration rejected" || echo "FAIL: Admin registration not blocked: $REGISTER_RES"

echo "=== 5. Protected Route Without Token ==="
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/users/profile" | grep -q "401" && echo "PASS: GET /users/profile rejects unauthenticated (401)" || echo "FAIL: Auth bypass on /users/profile"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/admin/dashboard/stats" | grep -q "401" && echo "PASS: GET /admin/dashboard/stats rejects unauthenticated (401)" || echo "FAIL: Auth bypass on admin dashboard"
```
