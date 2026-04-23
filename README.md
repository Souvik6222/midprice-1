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
| Data Fetching | TanStack Query (React Query) | Cache + background refetch for prices |
| Backend Framework | Node.js + Express | Unified JS stack, asynchronous performance |
| Database | MongoDB | Document-based flexible schema |
| ODM | Mongoose | Data schemas and validation |
| Auth | JWT (Json Web Token) | Role claims in token payload |

---

## File Structure

```text
medprice/
│
├── README.md
├── .env.example
│
├── client/                            # React App (Create React App)
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.js                     # Root component
│       ├── index.js                   # Entry point
│       │
│       ├── components/                # Shared, role-agnostic components
│       ├── hooks/                     # Custom React hooks
│       ├── layouts/                   # Patient/Vendor layouts
│       ├── lib/                       # API client and utilities
│       ├── pages/                     # Application pages (auth, patient, vendor)
│       │   └── auth/                  # Authentication pages (e.g., Login.jsx)
│       ├── router/                    # React Router configuration
│       └── store/                     # Zustand state stores
│
└── server/                            # Node.js + Express app
    ├── package.json
    ├── server.js                      # App entry point
    │
    ├── config/                        # Database configuration, etc.
    ├── controllers/                   # Route logic (authController, etc.)
    ├── middleware/                    # authMiddleware, etc.
    ├── models/                        # Mongoose schemas (User, Medicine, Pharmacy, etc.)
    ├── routes/                        # Express Router mounts
    └── utils/                         # Helper utilities (generateToken.js)
```

---

## Database Schema (Key Collections)

```javascript
// Conceptual Mongoose Models
User          { _id, name, email, password, role: 'patient'|'vendor', createdAt }
Pharmacy      { _id, vendorId, name, location, address }
Medicine      { _id, name, genericName, manufacturer }
Inventory     { _id, pharmacyId, medicineId, price, stock }
Reservation   { _id, patientId, pharmacyId, medicineId, status, createdAt }
```

---

## Local Setup

```bash
# 1. Clone
git clone https://github.com/yourname/medprice.git
cd medprice

# 2. Environment
# In the server directory, create a .env file based on .env.example (if available) or add:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

# 3. Install Dependencies & Start
# Open two terminals:

# Terminal 1 - Server:
cd server
npm install
npm run dev

# Terminal 2 - Client:
cd client
npm install
npm start

# Server runs on: http://localhost:5000
# Client runs on: http://localhost:3000
```

---

<div align="center">
Built to fix a real problem — one prescription at a time.
</div>
