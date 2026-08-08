# Mini ERP + CRM Operations Portal

A production-quality full-stack Mini ERP + CRM Operations Portal for wholesale/distribution companies. Manage customers, products, inventory, sales challans, and CRM follow-ups with role-based access control.

## 🚀 Features

### Core Modules
- **Authentication & RBAC** — JWT-based login with 4 roles (Admin, Sales, Warehouse, Accounts)
- **Customer CRM** — Full customer management with follow-up tracking
- **Product & Inventory** — Product catalog with real-time stock management
- **Stock Movements** — Complete audit trail of all inventory changes
- **Sales Challans** — Draft → Confirm workflow with atomic stock deduction
- **Dashboard** — KPI cards, charts, recent activity, and alerts

### Business Logic
- **Draft Challan** — Saves without affecting stock
- **Confirm Challan** — Atomically validates and deducts stock via PostgreSQL RPC
- **Insufficient Stock** — Entire confirmation fails with no partial updates
- **Product Snapshots** — Historical price/name preserved in challan items
- **Auto Challan Numbers** — `CH-YYYY-NNNN` format, generated server-side

### Technical Highlights
- Clean architecture: Routes → Controllers → Services → Database
- Centralized error handling with consistent API responses
- Input validation on both frontend (React Hook Form) and backend (Joi)
- Role-based authorization on every API endpoint
- Search, filter, and pagination on all listing APIs
- Responsive UI (desktop-first, mobile-compatible)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| JavaScript | Language |
| Tailwind CSS 3 | Styling |
| React Router DOM | Client-side routing |
| Axios | HTTP client |
| React Hook Form | Form management |
| Lucide React | Icons |
| Recharts | Dashboard charts |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| JavaScript | Language |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Joi | Request validation |
| Helmet | Security headers |
| Morgan | Request logging |
| CORS | Cross-origin support |

### Database
| Technology | Purpose |
|-----------|---------|
| Supabase PostgreSQL | Primary database |
| PostgreSQL RPC | Atomic transactions |

---

## 📦 Project Structure

```
mini-erp-crm/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (Auth)
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Route pages
│   │   ├── routes/         # Route guards
│   │   ├── services/       # API service layers
│   │   ├── utils/          # Helpers & constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── config/         # Supabase & env config
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/      # Auth, RBAC, error handling
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic
│   │   ├── validators/     # Joi schemas
│   │   ├── utils/          # Response helpers
│   │   ├── app.js
│   │   ├── server.js
│   │   └── seed.js
│   ├── package.json
│   └── .env.example
├── database/
│   └── schema.sql          # Complete PostgreSQL schema
├── README.md
└── .gitignore
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- npm
- Supabase account

### 1. Clone Repository
```bash
git clone <repository-url>
cd mini-erp-crm
```

### 2. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Run the entire contents of `database/schema.sql`
4. Copy your **Project URL** and **Service Role Key** from Settings → API

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials and JWT secret
npm install
npm run seed    # Seeds sample data (users, customers, products, challans)
npm run dev     # Starts on http://localhost:5000
```

### 4. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env if backend is on a different URL
npm install
npm run dev     # Starts on http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend `.env`
| Variable | Description | Example |
|----------|------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | Secret for JWT signing | `your-secure-secret-key` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGci...` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend `.env`
| Variable | Description | Example |
|----------|------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 👥 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123 |
| Sales | sales@example.com | Sales@123 |
| Warehouse | warehouse@example.com | Warehouse@123 |
| Accounts | accounts@example.com | Accounts@123 |

---

## 🔒 Role Permissions

| Feature | Admin | Sales | Warehouse | Accounts |
|---------|-------|-------|-----------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Customers (CRUD) | Full | Create/Edit/View | View | View |
| Follow-ups | Full | Full | — | View |
| Products (CRUD) | Full | View | Full | View |
| Stock IN/OUT | ✅ | — | ✅ | — |
| Challans | Full | Create/Confirm | View | View |
| User Management | ✅ | — | — | — |

---

## 📡 API Documentation

### Authentication
```
POST   /api/auth/login          Login
GET    /api/auth/me             Get current user
```

### Customers
```
GET    /api/customers           List (search, filter, paginate)
GET    /api/customers/:id       Get by ID
POST   /api/customers           Create
PUT    /api/customers/:id       Update
DELETE /api/customers/:id       Deactivate
GET    /api/customers/:id/followups    Get follow-ups
POST   /api/customers/:id/followups    Add follow-up
```

### Products
```
GET    /api/products            List (search, filter, paginate)
GET    /api/products/:id        Get by ID
POST   /api/products            Create
PUT    /api/products/:id        Update
POST   /api/products/:id/stock-in     Add stock
POST   /api/products/:id/stock-out    Remove stock
GET    /api/products/:id/stock-movements  Movement history
GET    /api/products/stock-movements      All movements
```

### Challans
```
GET    /api/challans            List (search, filter, paginate)
GET    /api/challans/:id        Get by ID (with items)
POST   /api/challans            Create (DRAFT)
PUT    /api/challans/:id        Update (DRAFT only)
POST   /api/challans/:id/confirm      Confirm (atomic stock reduction)
POST   /api/challans/:id/cancel       Cancel (DRAFT only)
```

### Dashboard
```
GET    /api/dashboard           KPIs, charts, recent activity
```

### Users (Admin only)
```
GET    /api/users               List all users
POST   /api/users               Create user
```

### API Response Format
```json
// Success
{ "success": true, "message": "...", "data": {...} }

// Error
{ "success": false, "message": "...", "errors": [...] }

// Paginated
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 } }
```

---

## 💡 Business Logic

### Challan Workflow
1. **Create Draft** — Products are selected with quantities. Stock is NOT affected.
2. **Confirm Challan** — Atomic PostgreSQL transaction:
   - Validates all product stock availability
   - Deducts stock from each product
   - Creates OUT stock movement records
   - Updates challan status to CONFIRMED
   - If ANY product has insufficient stock → entire transaction rolls back
3. **Cancel Challan** — Only DRAFT challans can be cancelled. CONFIRMED challans cannot be reversed.

### Stock Management
- **Stock IN** — Increases `current_stock`, creates IN movement
- **Stock OUT** — Decreases `current_stock`, creates OUT movement
- **Never allows negative stock** — Validated at service and database level
- **Low stock alerts** — Products where `current_stock <= minimum_stock`

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
# Set VITE_API_URL environment variable
```

### Backend → Render / Railway / EC2
```bash
cd backend
# Set all environment variables
# Start command: npm start
# Port: process.env.PORT
```

### Configuration
- Set `CLIENT_URL` on backend to match deployed frontend URL
- Set `VITE_API_URL` on frontend to match deployed backend URL
- Ensure CORS is configured correctly

---

## 📝 Seed Data

The seed script (`npm run seed`) creates:
- **4 users** (Admin, Sales, Warehouse, Accounts)
- **10 customers** (various statuses and types)
- **10 products** (various categories, some with low stock)
- **10 stock movements** (initial stock IN)
- **3 follow-ups** (with upcoming dates)
- **2 challans** (1 DRAFT, 1 CONFIRMED with stock deduction)

---

## 📜 License

This project was built as a case study for FundsRoom.
