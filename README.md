<div align="center">

```
███╗   ███╗███████╗██████╗ ██████╗ ██████╗ ██╗ ██████╗███████╗
████╗ ████║██╔════╝██╔══██╗██╔══██╗██╔══██╗██║██╔════╝██╔════╝
██╔████╔██║█████╗  ██║  ██║██████╔╝██████╔╝██║██║     █████╗  
██║╚██╔╝██║██╔══╝  ██║  ██║██╔═══╝ ██╔══██╗██║██║     ██╔══╝  
██║ ╚═╝ ██║███████╗██████╔╝██║     ██║  ██║██║╚██████╗███████╗
╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝╚══════╝
```

**Know the price before you pay.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)

</div>

---

## The Problem

Patients across India discover the same prescription medicine — same brand, same dosage, same strip count — priced **30–50% differently** across pharmacy chains within walking distance of each other. There is no transparent, real-time price comparison tool that lets a patient find the most affordable nearby source *before* they walk to the counter and pay.

MedPrice solves this. It is a **role-based web platform** where patients compare live medicine prices across nearby pharmacies, and pharmacies manage their own inventory and pricing in real time.

---

## How I Executed This

### The Core Insight
The problem is a **data availability + visibility gap**, not a logistics problem. Patients don't need delivery — they need to know which of the three pharmacies on their street has Metformin 500mg for ₹38 instead of ₹61. The solution is therefore a comparison engine with a lightweight reservation system, not another quick-commerce clone.

### Architecture Decision
I split the system into two clearly separated roles at the auth layer — **Patient** and **Pharmacy (Vendor)** — each with a distinct UI surface and permission scope. A patient can only read prices and create reservations. A vendor can only manage their own inventory and fulfill reservations for their registered pharmacy. No cross-role data leakage.

### Why This Stack (MERN)
- **React (Create React App)** on the frontend for fast iteration, component reuse across roles, and a snappy user experience.
- **Node.js + Express** on the backend for a unified JavaScript experience across the stack, enabling faster feature development and seamless JSON handling.
- **MongoDB** as the primary store — its flexible document model is perfect for medicine data which can vary significantly in attributes.
- **Mongoose** for elegant MongoDB object modeling and validation.
- **JWT + Bcrypt** for secure, stateless authentication and authorization.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend Framework | React 18 | Component-based role UIs |
| State Management | Zustand | Lightweight, no boilerplate |
| HTTP Client | Axios | Interceptors for JWT auth |
| Backend Framework | Node.js + Express | Unified JS stack, async performance |
| Database | MongoDB | Document-based flexible schema |
| ODM | Mongoose | Data schemas and validation |
| Auth | JWT (Json Web Token) | Role claims in token payload |

---

## Local Setup

```bash
# 1. Clone
git clone https://github.com/Souvik6222/midprice-1.git
cd midprice-1

# 2. Server setup
cd server
cp .env.example .env       # Edit with your MongoDB URI and JWT secret
npm install
npm run dev                 # Runs on http://localhost:5000

# 3. Client setup (new terminal)
cd client
cp .env.example .env        # Default: REACT_APP_API_URL=http://localhost:5000
npm install
npm start                   # Runs on http://localhost:3000

# 4. Seed the database (optional — adds test users + medicines)
cd server
node seed.js
# Test accounts:
#   Patient:  9876543210 / OTP: 123456
#   Vendor 1: 9876543211 / OTP: 123456
#   Vendor 2: 9876543212 / OTP: 123456
```

### Environment Variables

**server/.env.example**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_here
```

**client/.env.example**
```
REACT_APP_API_URL=http://localhost:5000
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user (patient/vendor) |
| POST | `/api/auth/login` | Public | Login with phone + OTP |

### Medicine Search (Public)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/medicines/search?q=&lat=&lng=` | Public | Search medicines near location |
| GET | `/api/medicines/:id/prices?lat=&lng=` | Public | Price comparison for a specific medicine |

### Patient Reservations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/reservations` | Patient | Create a new reservation |
| GET | `/api/reservations` | Patient | List my reservations |

### Vendor Inventory
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/vendor/inventory` | Vendor | List pharmacy inventory |
| POST | `/api/vendor/inventory` | Vendor | Add medicine to inventory |
| PATCH | `/api/vendor/inventory/:id` | Vendor | Update price/stock |
| DELETE | `/api/vendor/inventory/:id` | Vendor | Unlist a medicine (soft delete) |

### Vendor Reservations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/reservations/vendor?status=` | Vendor | List pharmacy reservations |
| PATCH | `/api/reservations/vendor/:id/status` | Vendor | Update reservation status |

### Health
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Server health check |

---

## File Structure

```text
midprice-1/
│
├── README.md
│
├── client/                            # React App (Create React App)
│   ├── .env.example
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.js                     # Root component
│       ├── index.js                   # Entry point
│       ├── lib/api.js                 # Axios instance + JWT interceptors
│       ├── store/authStore.js         # Zustand auth state
│       ├── router/
│       │   ├── index.jsx              # All routes
│       │   └── ProtectedRoute.jsx     # Role-based route guard
│       ├── layouts/                   # Patient/Vendor shell layouts
│       └── pages/
│           ├── auth/                  # RoleSelector, Login
│           ├── patient/               # Home, Search, Detail, Reservation, Reservations
│           ├── vendor/                # Dashboard, Inventory, Reservations
│           └── NotFound.jsx           # 404 page
│
└── server/                            # Node.js + Express API
    ├── .env.example
    ├── package.json
    ├── server.js                      # App entry point
    ├── seed.js                        # Database seeder
    ├── config/db.js                   # MongoDB connection
    ├── controllers/                   # Auth, Medicine, Inventory, Reservation
    ├── middleware/authMiddleware.js    # JWT protect + role guard
    ├── models/                        # User, Pharmacy, Medicine, Inventory, Reservation
    ├── routes/                        # Express Router mounts
    └── utils/generateToken.js         # JWT helper
```

---

## Database Schema

```javascript
User          { _id, name, phone, password, role: 'patient'|'vendor', otp }
Pharmacy      { _id, vendorId, name, address, lat, lng, hours }
Medicine      { _id, name, genericName, manufacturer, dosage, packSize }
Inventory     { _id, pharmacyId, medicineId, mrp, sellingPrice, stockQty, isListed }
Reservation   { _id, patientId, pharmacyId, medicineId, qty, status, reservationCode }
```

---

<div align="center">
Built to fix a real problem — one prescription at a time.
</div>
