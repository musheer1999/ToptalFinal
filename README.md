# 🍔 Mealroute — Food Delivery App

Full-stack food delivery web application built for the Toptal screening project.

## Project Structure

```
mealroute/
├── backend/                          ← Node.js + Express + PostgreSQL API
│   ├── server.js                     ← Entry point — Express + Socket.io
│   ├── database/schema.sql           ← Run once to create tables
│   ├── .env                          ← DB credentials, JWT secret
│   └── src/
│       ├── config/database.js        ← PostgreSQL connection pool
│       ├── middleware/               ← JWT auth + role checks
│       ├── utils/jwt.js              ← Token generation/verification
│       ├── controllers/              ← Business logic
│       │   ├── authController.js
│       │   ├── restaurantController.js
│       │   ├── mealController.js
│       │   ├── couponController.js
│       │   ├── orderController.js
│       │   └── userController.js
│       └── routes/                   ← URL routing
│           ├── authRoutes.js
│           ├── restaurantRoutes.js
│           ├── mealRoutes.js         ← nested under restaurants
│           ├── couponRoutes.js       ← nested under restaurants
│           ├── orderRoutes.js
│           └── userRoutes.js
│
└── frontend/                         ← React 18 + React Router v6
    └── src/
        ├── App.js                    ← Routes mapping
        ├── index.js                  ← Entry point
        ├── context/StoreContext.js   ← Global state + API calls
        ├── data/seedData.js          ← Constants (cuisines, meal types)
        ├── components/
        │   ├── NavBar.js             ← Responsive top navigation
        │   └── ui/                   ← Reusable components
        │       ├── Button.js
        │       ├── Input.js
        │       ├── Modal.js
        │       ├── Card.js
        │       ├── Field.js
        │       ├── Select.js
        │       ├── Textarea.js
        │       ├── QtyStepper.js
        │       ├── StatusBadge.js
        │       ├── EmptyState.js
        │       ├── Banner.js
        │       ├── Toast.js
        │       ├── helpers.js        ← formatters: fmtMoney, fmtDate
        │       └── index.js          ← barrel exports
        └── pages/
            ├── auth/                 ← Public pages
            │   ├── LandingPage.js
            │   ├── SignInPage.js
            │   ├── SignUpPage.js
            │   └── AuthCard.js       ← Shared layout for auth pages
            ├── customer/             ← Customer-only pages
            │   ├── BrowseRestaurantsPage.js
            │   ├── BrowseMealsPage.js
            │   ├── CartPage.js
            │   ├── CustomerOrdersPage.js
            │   ├── OrderDetailPage.js
            │   └── _shared.js        ← PageShell, PageHeader, Timeline
            └── owner/                ← Restaurant owner pages
                ├── OwnerOrdersPage.js
                ├── ManageRestaurantsPage.js
                ├── ManageMealsPage.js
                ├── ManageCouponsPage.js
                ├── ManageUsersPage.js
                └── _shared.js        ← Owner-specific layout helpers
```

---

## 🚀 Setup Instructions

### Step 1 — Database Setup
1. Install PostgreSQL and create a database named `food_delivery`
2. In pgAdmin → right-click your database → Query Tool
3. Paste the contents of `backend/database/schema.sql` and click Execute ▶

### Step 2 — Backend Setup
```bash
cd backend
npm install
```
Edit `.env` and set your PostgreSQL password:
```
DB_PASSWORD=your_actual_password
```
Start the backend:
```bash
npm run dev
```
Backend runs at: **http://localhost:5000**

Test it: open http://localhost:5000 in your browser — you should see `🍔 Food Delivery API is running!`

### Step 3 — Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs at: **http://localhost:3000**

---

## 🌐 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/restaurants | Browse all restaurants |
| GET | /api/restaurants/my | Owner's restaurant |
| POST | /api/restaurants | Create restaurant |
| PUT | /api/restaurants/:id | Update restaurant |
| GET | /api/restaurants/:id/meals | Get meals |
| POST | /api/restaurants/:id/meals | Create meal |
| PUT | /api/restaurants/:id/meals/:mealId | Update meal |
| DELETE | /api/restaurants/:id/meals/:mealId | Delete meal |
| GET | /api/restaurants/:id/coupons | Get coupons |
| POST | /api/restaurants/:id/coupons | Create coupon |
| POST | /api/restaurants/:id/coupons/validate | Validate coupon code |
| PUT | /api/restaurants/:id/coupons/:couponId | Update coupon |
| DELETE | /api/restaurants/:id/coupons/:couponId | Delete coupon |
| POST | /api/orders | Place order |
| GET | /api/orders/my | Customer order history |
| GET | /api/orders/restaurant/:id | Restaurant's orders |
| GET | /api/orders/:id | Single order detail |
| PATCH | /api/orders/:id/status | Update order status |
| POST | /api/orders/:id/reorder | Reorder |
| GET | /api/users | All customers (owner) |
| POST | /api/users/:id/block | Block user |
| DELETE | /api/users/:id/block | Unblock user |

---

## 📋 Order Status Flow

```
Placed → Processing → In Route → Delivered → Received
  ↓           ↓
Canceled   Canceled
```
- **Owner** advances: Placed → Processing → In Route → Delivered
- **Customer** can: Mark Delivered → Received, or Cancel from Placed/Processing

---

## 🛠 Tech Stack

**Backend:** Node.js, Express.js, PostgreSQL, JWT, bcryptjs, Socket.io

**Frontend:** React 18, React Router v6, CSS-in-JS (inline styles)

---

## 🏗️ Architecture Highlights

- **JWT Authentication** — stateless tokens stored in localStorage
- **Role-Based Access Control** — separate middleware for customers vs owners
- **Database Transactions** — order placement uses BEGIN/COMMIT/ROLLBACK for data integrity
- **Nested Routes** — meals and coupons routed under their parent restaurant (RESTful)
- **Status Flow Validation** — backend prevents invalid status transitions (e.g., can't go backwards)
- **Block System** — owners can prevent specific customers from ordering
- **One Restaurant Per Owner** — enforced via UNIQUE constraint on owner_id
- **React Context** — global state without external libraries (Redux not needed)
- **Component Splitting** — each page in its own file for easy navigation/editing
- **Mobile Responsive** — works from 280px → desktop without horizontal scroll
