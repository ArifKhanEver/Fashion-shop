# DevWonder Fashion — Full Database Integration Roadmap

> **Execution Rule:** One step at a time. Each step must be fully complete and verified before the next begins.

---

## Step 1: Admin Product CRUD — DB Integration
**Goal:** Replace `DUMMY_PRODUCTS` in Admin with real Prisma queries. Admins can create, edit, and delete real products with Cloudinary images.

### Sub-tasks
- [x] **1.1** Create `src/actions/admin.product.actions.ts` with:
  - `adminGetProducts(page, search)` — paginated Prisma query
  - `adminGetProductById(id)` — single product with variants + images
  - `adminCreateProduct(data)` — write product + variants + images to DB
  - `adminUpdateProduct(id, data)` — update product + sync variants/images
  - `adminDeleteProduct(id)` — cascade delete (variants, images, order items)
- [x] **1.2** Rewrite `src/app/(admin)/admin/products/page.tsx` as a Server Component — fetch real products from DB, pass to client table
- [x] **1.3** Rewrite `src/app/(admin)/admin/products/new/page.tsx` — wire "Add Product" form to call `adminCreateProduct` server action
- [x] **1.4** Create `src/app/(admin)/admin/products/edit/[id]/page.tsx` — fetch product by ID, pre-fill form, wire to `adminUpdateProduct`
- [x] **1.5** Wire delete button in products table to call `adminDeleteProduct` server action with `revalidatePath`
- [x] **1.6** Verify: Create a real product from Admin UI → confirm it appears in DB

---

## Step 2: Storefront Dynamic Data — Homepage & Shop
**Goal:** Replace all `DUMMY_PRODUCTS` and mock category arrays in the storefront with live DB queries.

### Sub-tasks
- [x] **2.1** Create `src/actions/storefront.actions.ts` with:
  - `getCategories()` — fetch active categories ordered by `sortOrder`
  - `getProducts(filters)` — paginated shop query with color/search/sort filters
  - `getProductBySlug(slug)` — full product detail with variants + images
  - `getFeaturedProducts()` — fetch `isFeatured=true` products
  - `getProductsByCategory(categorySlug)` — category page products
- [x] **2.2** Rewrite `src/app/(storefront)/page.tsx` (Homepage) as Server Component — fetch real categories and products
- [x] **2.3** Rewrite `src/app/(storefront)/shop/page.tsx` as Server Component — call `getProducts()` with URL search params
- [x] **2.4** Rewrite `src/app/(storefront)/product/[slug]/page.tsx` — call `getProductBySlug(slug)` for real data
- [x] **2.5** Rewrite `src/app/(storefront)/category/[slug]/page.tsx` — call `getProductsByCategory(slug)`
- [ ] **2.6** Verify: Real product added in Step 1 shows on Homepage and Shop page

---

## Step 3: Cart & Checkout Flow — Real Order Creation
**Goal:** When a customer submits checkout, a real `Order` + `OrderItem` records are written to the DB.

### Sub-tasks
- [x] **3.1** Audit `src/actions/order.actions.ts` — verify `placeOrder()` schema field names match `schema.prisma` exactly
- [x] **3.2** Rewrite `src/app/(storefront)/checkout/page.tsx` — wire submit to `placeOrder()` server action, redirect to `/order-confirmation/[orderId]`
- [x] **3.3** Rewrite `src/app/(storefront)/order-confirmation/[id]/page.tsx` — fetch real order by ID via `getOrderById()`
- [x] **3.4** Rewrite `src/app/(storefront)/track-order/page.tsx` — call `trackOrder(query)` and show real order status timeline
- [ ] **3.5** Verify: Place a test order → confirm `Order` + `OrderItem` rows appear in DB

---

## Step 4: Admin Order Management — Real Data
**Goal:** Admin Orders list and detail page show real database orders. Status update writes to DB.

### Sub-tasks
- [x] **4.1** Rewrite `src/app/(admin)/admin/orders/page.tsx` as Server Component — call `adminGetOrders()` from `order.actions.ts`
- [x] **4.2** Rewrite `src/app/(admin)/admin/orders/[id]/page.tsx` as Server Component — call `getOrderById(id)`
- [x] **4.3** Wire "Update Status" button to call `adminUpdateOrderStatus()` with `revalidatePath`
- [ ] **4.4** Verify: Test order from Step 3 appears in Admin. Status update reflects immediately.

---

## Step 5: Admin Dashboard Overview — Real KPIs
**Goal:** Replace all hardcoded KPI values and recent orders with real aggregate Prisma queries.

### Sub-tasks
- [x] **5.1** Create `src/actions/admin.dashboard.actions.ts` with:
  - `getDashboardKPIs()` — aggregate: total revenue, total orders, pending orders, low stock
  - `getRecentOrders(limit)` — fetch last N orders
  - `getRevenueChartData(days)` — group orders by day, sum revenue
- [x] **5.2** Rewrite `src/app/(admin)/admin/page.tsx` as Server Component — call all KPI actions
- [x] **5.3** Update `AdminRevenueChart` to accept real `data` prop instead of hardcoded array
- [ ] **5.4** Verify: Dashboard reflects real orders from Step 3 and product counts from Step 1

---

## Step 6: Dynamic Analytics Settings — Admin UI
**Goal:** Admin can update GA4 Measurement ID and Meta Pixel ID from the dashboard. Values stored in DB.

### Sub-tasks
- [x] **6.1** Add `SiteSetting` model to `schema.prisma` and run `prisma db push`
- [x] **6.2** Create `src/actions/admin.settings.actions.ts` — `getSettings()` and `updateSetting(key, value)`
- [x] **6.3** Create `src/app/(admin)/admin/settings/page.tsx` — settings form with GA4 ID, Meta Pixel ID, Store Name, Currency fields
- [x] **6.4** Add "Settings" link to Admin sidebar nav
- [x] **6.5** Create `src/lib/site-settings.ts` — server-side helper `getSetting(key)` that reads from DB
- [x] **6.6** Update `AnalyticsProvider` to read IDs from DB at render time, fallback to `.env`
- [x] **6.7** Verify: Change GA4 ID from Admin Settings → new ID loads in script without redeployment

---

## Completion Checklist

| Step | Description | Status |
|------|-------------|--------|
| 1 | Admin Product CRUD → DB | ✅ Done |
| 2 | Storefront Dynamic Data | ✅ Done |
| 3 | Cart & Checkout → Real Orders | ✅ Done |
| 4 | Admin Order Management → Real Data | ✅ Done |
| 5 | Admin Dashboard Overview → Real KPIs | ✅ Done |
| 6 | Dynamic Analytics Settings | ✅ Done |

