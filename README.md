# Mini ERP + CRM Operations Portal

A production-quality full-stack Mini ERP + CRM Operations Portal for wholesale/distribution companies. Manage customers, products, inventory, sales challans, and CRM follow-ups with role-based access control.

## 🔗 Live Demo Links

- **Frontend Application:** [http://54.227.176.149](http://54.227.176.149)
- **Backend API Base URL:** [http://54.227.176.149:5000/api](http://54.227.176.149:5000/api)

## 🚀 Features

### Core Modules
- **Authentication & RBAC** — JWT-based login with 4 roles (Admin, Sales, Warehouse, Accounts) and **Admin User Management (CRUD)**
- **Customer CRM** — Full customer management with follow-up tracking
- **Product & Inventory** — Product catalog with real-time stock management and **AWS S3 image uploads**
- **Stock Movements** — Complete audit trail of all inventory changes
- **Sales Challans** — Draft → Confirm workflow with atomic stock deduction and **PDF exports**
- **Dashboard** — KPI cards, charts, recent activity, and alerts

### Business Logic
- **Draft Challan** — Saves without affecting stock
- **Confirm Challan** — Atomically validates and deducts stock via PostgreSQL RPC
- **Insufficient Stock** — Entire confirmation fails with no partial updates
- **Product Snapshots** — Historical price/name preserved in challan items
- **Auto Challan Numbers** — `CH-YYYY-NNNN` format, generated server-side
- **AWS S3 Fallback** — Uploads fallback to high-quality mock product image URLs if S3 keys are not configured in `.env`
- **Branded PDF Export** — Clients can instantly export and download invoice receipts/delivery challans formatted with standard A4 page layouts

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
| jsPDF & jsPDF-AutoTable | Branded PDF Invoice Generation |
| Lucide React | Icons |
| Recharts | Dashboard charts |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| JavaScript | Language |
| AWS SDK (`@aws-sdk/client-s3`) | S3 Image storage uploads |
| Multer | Multipart file uploading middleware |
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
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 uploads (Optional) | `AKIA2UZY...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 uploads (Optional) | `iwXNjlQS...` |
| `AWS_REGION` | AWS region hosting the S3 bucket (Optional) | `us-east-1` |
| `AWS_BUCKET_NAME` | AWS S3 bucket name for product images (Optional) | `my-erp-uploads` |

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
POST   /api/products/upload     Upload product image to S3 (returns public URL)
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
PUT    /api/users/:id           Update user details
DELETE /api/users/:id           Delete user (with safety relational checks)
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

## 🏛️ Architecture Overview

The system follows a modern full-stack SPA decoupled architecture:

### 1. Backend Architecture (Node.js & Express)
* **Design Pattern:** Follows the **Controller-Service-Repository** pattern.
  * **Routes:** Intercepts HTTP requests, validates requests using Joi validation schemas, and enforces Role-Based Access Control (RBAC) via the `authorizeRoles` middleware.
  * **Controllers:** Handles HTTP status codes and formats standardized JSON API responses.
  * **Services:** Houses all core business logic (e.g., S3 upload helpers, PDF data processors).
  * **Database layer:** Communicates with Supabase PostgreSQL using the service-role client.
* **Security:** Secured using `helmet` headers, CORS protection (restricted to client URLs), and password hashing via `bcryptjs`.

### 2. Frontend Architecture (React 18 & Vite)
* **State Management:** Simple Context API is used for centralized authentication and session persistence (`AuthContext`).
* **Router Guards:** Secure client-side routes (`ProtectedRoute`) that conditionally redirect users if they lack the required RBAC privileges.
* **Form & Validation:** Managed via `react-hook-form` to ensure smooth local input verification and state binding.
* **Component-driven Design:** Follows a reusable card, modal, and custom uploader layout design.

---

## ⚡ Technical Decisions & Known Limitations

1. **JavaScript vs. TypeScript:**
   * *Decision:* The template was initiated in ES6 JavaScript. For speed of delivery and to preserve the existing code's integrity within the 48-hour deadline, JavaScript was retained rather than performing a complete project rewrite.

2. **AWS S3 Public Access & Fallback:**
   * *Decision:* Product images need to be publicly visible in browsers. To achieve this, the S3 bucket must have **Block Public Access: OFF** and a bucket policy set to public-read.
   * *Fallback:* If S3 credentials (`AWS_ACCESS_KEY_ID`, etc.) are missing from the `.env` file, the backend prints a startup warning and gracefully returns high-quality placeholder image links to ensure the application remains fully functional in local development modes.

3. **Supabase Database Cold Starts:**
   * *Limitation:* The database is hosted on Supabase's free tier. If the database remains idle, initial queries might face a slight cold-start latency of a few seconds while the PostgreSQL instance spins up.

4. **jsPDF Encoding & Currency Formatting:**
   * *Limitation:* Standard fonts embedded in `jsPDF` (like Helvetica) do not support Unicode currency signs (such as the Indian Rupee `₹` symbol) and will render them as garbled blocks.
   * *Decision:* To avoid importing heavy custom TTF fonts into the bundle, prices in the exported PDF are formatted as `INR` strings (e.g., `INR 1,999.00`).

---

## 📋 Assumptions Made

1. **Role Restrictions:**
   * **Sales** users are assumed to only manage customers, followups, and create challans. They cannot modify stock, trigger stock-in/stock-out, or view stock movement logs.
   * **Warehouse** users are assumed to manage products and trigger stock movements, but they cannot CRUD customers.
2. **Sales Challan Confirmation:**
   * Confirming a Challan is final and immutable. Once stock is deducted and the status transitions from `DRAFT` to `CONFIRMED`, it cannot be reverted back to draft.
3. **Atomic Stock Decrements:**
   * If a challan has multiple products, the stock deduction must happen atomically. If any product is short on stock, the entire confirmation fails and rolls back, ensuring stock levels never go negative.
4. **User Deletion Safety Guards:**
   * Users who have associated historical transactional items (e.g. created follow-ups, challans, or stock movements) are protected from deletion to preserve referential history integrity. The system intercepts the database cascade error and informs the Admin gracefully.

---

## 📜 License

This project was built as a case study for FundsRoom.
