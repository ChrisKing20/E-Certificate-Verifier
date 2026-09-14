# E-Certificate Verifier 🎓📜

A secure digital event certificate verification system for academic institutions and colleges.

**Project Completion Status:** `50% Completed` (25% Frontend + 25% Backend & MongoDB Database Logic)

---

## 🚀 Overview

The **E-Certificate Verifier** enables college administrators to securely issue digital event certificates, while allowing students, recruiters, and the public to verify certificate authenticity through:
1. **Unique Certificate ID Lookup**
2. **Cryptographic SHA-256 PDF File Upload Verification**
3. **QR Code Scanning**

The backend is built with **Node.js, Express, TypeScript, MongoDB, and Mongoose ODM**, implementing JWT authentication, bcrypt password hashing, Multer file uploads, and full verification audit trail logging.

---

## 🛠️ Technology Stack

### Frontend (25%)
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Icons**: Lucide React

### Backend (25%)
- **Runtime**: Node.js + Express.js (TypeScript)
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens) & bcrypt
- **File Upload**: Multer (PDF documents, 10MB limit)
- **Cryptography**: Node.js `crypto` module (SHA-256)
- **QR Code**: `qrcode` library

---

## 📁 Exact Backend Structure

```
backend/
│
├── src/
│   ├── config/
│   │   └── db.ts                   # Mongoose MongoDB Connection
│   │
│   ├── models/
│   │   ├── Admin.ts                # Mongoose Admin Model
│   │   ├── Certificate.ts          # Mongoose Certificate Model
│   │   └── VerificationLog.ts      # Mongoose Verification Log Model
│   │
│   ├── controllers/
│   │   ├── authController.ts       # Login Handler
│   │   ├── certificateController.ts # Certificate Issue, Revoke & List Handlers
│   │   ├── verificationController.ts # Public Number & PDF Verification Handlers
│   │   └── adminController.ts      # Dashboard Stats Handler
│   │
│   ├── routes/
│   │   ├── authRoutes.ts           # Authentication Routes
│   │   ├── certificateRoutes.ts    # Certificate Management Routes
│   │   ├── verificationRoutes.ts   # Public & Log Verification Routes
│   │   └── adminRoutes.ts          # Admin Dashboard Routes
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts       # JWT Authentication Guard
│   │   └── uploadMiddleware.ts     # Multer 10MB PDF Uploader
│   │
│   ├── services/
│   │   ├── authService.ts          # Authentication Business Logic
│   │   ├── certificateService.ts   # Certificate Registry Business Logic
│   │   ├── verificationService.ts  # Verification & Hashing Business Logic
│   │   └── qrService.ts            # QR Code Generation Service
│   │
│   ├── utils/
│   │   └── hashFile.ts             # Node crypto SHA-256 Hashing Utility
│   │
│   ├── app.ts                      # Express Application setup
│   └── server.ts                   # Server entry point
│
├── uploads/                        # PDF documents & generated QR codes
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🍃 MongoDB Setup

1. **Install MongoDB** locally or obtain a MongoDB connection string.
2. Configure `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI="mongodb://localhost:27017/ecertificate"
   JWT_SECRET="ecert-verifier-super-secret-jwt-key-2026-phase2"
   CORS_ORIGIN="http://localhost:5173"
   NODE_ENV="development"
   ```

---

## 🌱 Seeding Admin Account

To seed the MongoDB database with the administrator account:

```bash
cd backend
npm run seed
```

### 🔑 Institutional Admin Credentials
- **Email**: `admin@ecertificate.local`
- **Password**: `Admin@123` *(Bcrypt hashed in MongoDB)*

---

## 🏃 How to Run

### 1. Start Backend Server (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 2. Start Frontend Server (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

### 🔓 Public Verification Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/verify/number/:certificateId` | Verify certificate by ID (e.g. `ECV-2026-001245`) |
| `POST` | `/api/verify/pdf` | Verify by PDF upload (calculates SHA-256 hash against MongoDB) |
| `GET` | `/api/health` | Backend service health check |

### 🔐 Protected Admin Endpoints *(Requires `Authorization: Bearer <JWT>`)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Admin authentication & JWT token issuance |
| `GET` | `/api/admin/dashboard/stats` | Fetch real database statistics |
| `GET` | `/api/admin/certificates` | Search, filter & paginate certificate registry |
| `POST` | `/api/certificates` | Issue new certificate with PDF upload & QR generation |
| `GET` | `/api/admin/certificates/:id` | Get detailed certificate record & audit logs |
| `PATCH` | `/api/admin/certificates/:id/revoke` | Flag/Revoke certificate with official reason |
| `GET` | `/api/admin/verification-logs` | View public verification query logs |
