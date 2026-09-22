# 📜 E-Cert-Verifier

**Tamper-Proof Academic & Multi-Institution Credential Verification Platform**

---

A multi-layered defense platform combining institutional multi-tenant database isolation, SHA-256 cryptographic PDF stream hashing, IPFS decentralized file storage via Pinata, scannable dynamic QR code payload verification, and smart contract anchoring on Ethereum Sepolia — built for universities, colleges, and digital event credential issuers.

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Super Admin & Institution Onboarding Workflow](#-super-admin--institution-onboarding-workflow)
- [Getting Started](#-getting-started)
- [Smart Contract & IPFS Integration](#-smart-contract--ipfs-integration)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Contributors](#-contributors)
- [References](#-references)
- [License](#-license)

---

## 🔍 Overview

Academic and digital credential fraud is a critical global challenge. Traditional single-tenant verification systems rely on basic database lookups or visual design checks, leaving severe vulnerabilities against document alteration or database tampering. **E-Cert-Verifier** introduces a defense-in-depth strategy with four sequential verification layers:

| Layer | Technology | What It Catches |
| :--- | :--- | :--- |
| 🔍 **Layer 1** | **Unique Certificate ID & Institutional Registry** | Non-existent, fabricated, or unapproved institutional certificate IDs |
| 🔐 **Layer 2** | **SHA-256 Cryptographic Stream Hash** | Post-issuance PDF document tampering, text edits, or pixel alterations |
| 📱 **Layer 3** | **Dynamic QR Code & IPFS Payload** | Fake certificate URLs, forged physical prints, or unverified scan codes |
| ⛓️ **Layer 4** | **Ethereum Sepolia Blockchain Anchor** | Centralized database tampering, backdated entries, & unauthorized record deletions |

The verification pipeline fails fast — if Layer 1 or Layer 2 detects a non-registered or altered document hash, subsequent steps provide immediate audit feedback without delay.

---

## ✨ Key Features

- 🏢 **Multi-Tenant Institutional Platform** — Isolated data per institution (`Institution A`, `Institution B`), preventing cross-tenant access to certificates, metrics, or user logs.
- 👑 **Super Admin Onboarding Approval** — DB-backed institution onboarding flow (`PENDING` -> Super Admin Approval -> `ACTIVE`). Admins cannot log in until their institution is approved.
- 🔑 **Multi-Role Authentication & OAuth** — Secure Email/Password and Google OAuth (`Continue with Google`) for Students (`USER`) and Institutional Administrators (`ADMIN`).
- 🔒 **Cryptographic Integrity & SHA-256** — Real-time SHA-256 binary hash generation & instant signature matching for uploaded PDF certificates.
- 📦 **IPFS Decentralized Storage** — Automatic PDF file pinning to IPFS via Pinata with fallback local storage and CID immutability.
- ⛓️ **Ethereum Sepolia Blockchain Anchor** — On-chain certificate hash registration via Solidity `CertificateRegistry.sol` contract formatted as `bytes32`.
- 📱 **QR Code Verification** — Instant public verification via Unique ID lookup (`ECV-2026-XXXXXX`), file upload, or live camera QR scanning.
- 📊 **Student & Admin Portals** — Dedicated Student Dashboard (`/dashboard`), Institution Admin Console (`/admin/dashboard`), and Platform Super Admin Console (`/superadmin/dashboard`).

---

## 🏗️ Architecture

```
                                    +-----------------------+
                                    |   Public / Verifier   |
                                    +-----------+-----------+
                                                |
                     +--------------------------+--------------------------+
                     |                          |                          |
              [ Unique ID ]              [ Upload PDF ]               [ Scan QR ]
                     |                          |                          |
                     v                          v                          v
         +-----------------------------------------------------------------------+
         |                 E-Cert-Verifier Frontend (React 18 + Vite + TS)       |
         +-----------------------------------+-----------------------------------+
                                             | HTTP / REST
                                             v
         +-----------------------------------------------------------------------+
         |                 E-Cert-Verifier Backend (Node.js + Express + TS)       |
         |                                                                       |
         |  +------------------+  +--------------------+  +--------------------+  |
         |  |  SHA-256 Crypto  |  |   IPFS Pinata SDK  |  |   QR Code Engine   |  |
         |  +------------------+  +--------------------+  +--------------------+  |
         +-------------------+-------------------+-------------------+-----------+
                             |                   |                   |
                             v                   v                   v
         +-----------------------+   +-------------------+   +-------------------+
         | MongoDB Atlas Cloud   |   | IPFS Gateway      |   | Ethereum Sepolia  |
         | - Multi-Tenant Users  |   | - Pinata Storage  |   | - Smart Contract  |
         | - Certificates & Logs |   | - Immutable CID   |   | - CertRegistry.sol|
         +-----------------------+   +-------------------+   +-------------------+
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
| :--- | :--- |
| **Node.js (v18+)** | Backend server runtime environment |
| **Express.js** | RESTful API framework |
| **TypeScript** | Type-safe backend development |
| **MongoDB Atlas + Mongoose** | Document database & Object Data Modeling (ODM) |
| **JWT & Bcrypt** | Multi-role authentication & password hashing |
| **Node Crypto** | Native SHA-256 hash generation for PDF binary streams |
| **Multer** | Multipart form data file uploader |
| **Pinata IPFS SDK** | Decentralized certificate storage & pinning |
| **Helmet & Express Rate Limit**| HTTP security headers and rate limiting protection |

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **React 18** | UI component architecture |
| **TypeScript** | Static typing across components & state |
| **Vite 5** | Lightning-fast build tool & dev server |
| **Tailwind CSS v4** | Modern utility-first CSS framework |
| **React Router DOM v7** | Client-side routing and page navigation |
| **Lucide React** | Crisp icon system |
| **Canvas Confetti** | Verification success animation |

### Smart Contract & Blockchain
| Technology | Purpose |
| :--- | :--- |
| **Solidity 0.8.20** | Smart contract language (`CertificateRegistry.sol`) |
| **OpenZeppelin Contracts (v5)**| Security standard primitives (`Ownable`) |
| **Hardhat** | Ethereum compilation, testing & deployment suite |
| **Ethers.js (v6)** | Web3 network provider & contract communication |
| **Ethereum Sepolia** | Public EVM testnet network |

---

## 👑 Super Admin & Institution Onboarding Workflow

```
1. Initial Platform Deployment:
   npm run seed:superadmin
        ↓
   SUPER_ADMIN Created (role = SUPER_ADMIN, status = ACTIVE, institutionId = null)

2. Institution Registration:
   Institution Onboarding Form (/register-institution)
        ↓
   Create Institution (status = PENDING)
   Create Institution Admin (role = ADMIN, status = PENDING, institutionId = inst._id)

3. Super Admin Approval:
   Super Admin Logs in (/admin/login or /login)
        ↓
   Navigates to /superadmin/dashboard
        ↓
   [ APPROVE ] ──> Institution = ACTIVE, Admin = ACTIVE ──> Admin can log in & issue certificates
   [ REJECT ]  ──> Institution = REJECTED, Admin = REJECTED
   [ SUSPEND ] ──> Institution = SUSPENDED, Admins lose access
```

---

## 🚀 Getting Started

### Prerequisites
| Requirement | Version |
| :--- | :--- |
| **Node.js** | v18.0.0 or higher |
| **npm** | v9.0.0 or higher |
| **MongoDB** | MongoDB Atlas URI or local MongoDB |
| **Git** | Latest |

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ChrisKing20/E-Certificate-Verifier.git
cd E-Certificate-Verifier
```

---

### 2️⃣ Backend Setup & Super Admin Seeding
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Seed Platform SUPER_ADMIN account
npm run seed:superadmin

# Start development backend server (Port 5000)
npm run dev
```

---

### 3️⃣ Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server (Port 5173)
npm run dev
```
Frontend runs at `http://localhost:5173`

---

### 4️⃣ Environment Variables

#### Backend Configuration (`backend/.env`)
```env
PORT=5000
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/ecertificate?retryWrites=true&w=majority"
JWT_SECRET="ecert-verifier-super-secret-jwt-key-2026-phase2"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"

# ── IPFS Storage Provider (Pinata) ──
IPFS_GATEWAY_URL="https://gateway.pinata.cloud/ipfs/"
IPFS_JWT="YOUR_PINATA_JWT_TOKEN"

# ── Blockchain Integration (Ethereum Sepolia) ──
CONTRACT_ADDRESS="0xd58d4369c1186aB7Bc9CFf2711d57D2fB026bA94"
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"

# ── Google OAuth Configuration ──
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"
FRONTEND_URL="http://localhost:5173"

# ── Super Admin Bootstrap Credentials ──
SUPER_ADMIN_NAME="Platform Super Admin"
SUPER_ADMIN_EMAIL="superadmin@verifier.org"
SUPER_ADMIN_PASSWORD="SuperAdminSecret123!"
```

---

## 🎯 Quick Start (TL;DR)

```bash
# Terminal 1 — Backend & Super Admin Seed
cd backend && npm install && npm run seed:superadmin && npm run dev

# Terminal 2 — Frontend UI
cd frontend && npm install && npm run dev

# Open http://localhost:5173 in browser
```

---

## ⛓️ Smart Contract & IPFS Integration

- **Network**: Ethereum Sepolia Testnet (Chain ID: `11155111`)
- **Deployed Contract Address**: [`0xd58d4369c1186aB7Bc9CFf2711d57D2fB026bA94`](https://sepolia.etherscan.io/address/0xd58d4369c1186aB7Bc9CFf2711d57D2fB026bA94#code)
- **Source**: [`blockchain/contracts/CertificateRegistry.sol`](blockchain/contracts/CertificateRegistry.sol)

| Function | Type | Description |
| :--- | :--- | :--- |
| `registerCertificate(certificateId, certificateHash)` | Write | Anchor SHA-256 certificate hash (as `bytes32`) on-chain |
| `verifyCertificate(certificateId, certificateHash)` | Read | Verify validity & hash matching status on-chain |
| `revokeCertificate(certificateId, reason)` | Write | Revoke a certificate record on-chain with official reason |
| `isCertificateRegistered(certificateId)` | Read | Check if a certificate ID is registered on-chain |

---

## 📡 API Reference

### 🔓 Public Authentication & Verification Endpoints
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Student account creation | ❌ |
| `POST` | `/api/auth/login` | Unified user & admin login | ❌ |
| `GET` | `/api/auth/google` | Initiate Google OAuth flow | ❌ |
| `POST` | `/api/institutions/register` | Submit institution onboarding request | ❌ |
| `GET` | `/api/verify/number/:certificateId` | Verify certificate by ID | ❌ |
| `POST` | `/api/verify/pdf` | Verify by PDF upload | ❌ |
| `GET` | `/api/health` | Backend service health check | ❌ |

### 🔐 Protected User Endpoints (`USER` / Student)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/certificates` | Get issued certificates for logged-in student | 🔐 `USER` |
| `GET` | `/api/user/profile` | Get student profile details | 🔐 `USER` |

### 🔐 Protected Admin Endpoints (`ADMIN` / Institution)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard/stats` | Institution-scoped statistics | 🔐 `ADMIN` |
| `POST` | `/api/certificates` | Issue certificate with PDF, IPFS pin & QR generation | 🔐 `ADMIN` |
| `PATCH` | `/api/admin/certificates/:id/revoke` | Revoke certificate | 🔐 `ADMIN` |

### 👑 Protected Super Admin Endpoints (`SUPER_ADMIN`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/institutions` | List all institutions & pending onboarding requests | 👑 `SUPER_ADMIN` |
| `PATCH` | `/api/institutions/:id/approve` | Approve institution & activate admin | 👑 `SUPER_ADMIN` |
| `PATCH` | `/api/institutions/:id/reject` | Reject institution onboarding | 👑 `SUPER_ADMIN` |
| `PATCH` | `/api/institutions/:id/suspend` | Suspend institution | 👑 `SUPER_ADMIN` |

---

## 📁 Project Structure

```
E-Cert-Verifier/
├── 🔧 backend/
│   ├── src/
│   │   ├── config/             # DB & Env configuration
│   │   ├── controllers/        # Request handlers (auth, inst, cert, user, admin)
│   │   ├── middleware/         # Auth, role & rate limit middlewares
│   │   ├── models/             # Mongoose schemas (User, Institution, Certificate, Log)
│   │   ├── routes/             # Express API routes
│   │   ├── scripts/            # Super Admin seed & multi-tenant migration scripts
│   │   ├── services/           # Business logic (IPFS, Blockchain, QR, Auth)
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # HTTP server entry point
│   ├── uploads/                # Local PDF & QR storage
│   ├── .env.example
│   └── package.json
│
├── ⛓️ blockchain/
│   ├── contracts/              # CertificateRegistry.sol
│   ├── scripts/                # Hardhat deployment script
│   └── package.json
│
├── 🎨 frontend/
│   ├── src/
│   │   ├── components/         # React UI components (Navbar, Footer, Badges)
│   │   ├── context/            # AuthContext provider
│   │   ├── pages/              # User, Admin, SuperAdmin & Public pages
│   │   ├── routes/             # ProtectedRoute guards
│   │   ├── services/           # Axios / Fetch API clients
│   │   └── App.tsx             # Main router
│   ├── package.json
│   └── vite.config.ts
│
├── LICENSE                     # MIT License
├── README.md                   # Main Documentation
└── package.json
```

---

## 📚 References

Literature survey entries used to motivate E-Cert-Verifier design decisions:
1. S. R. Babu et al., "Blockchain and hash-based certificate verification framework," Proc. ICSCSE, 2022.
2. J. Vidal et al., "Blockchain-based academic certificate management: integrity and revocation challenges," Proc. IEEE EDUCON, 2020.
3. H. Farid, "Image forgery detection: A survey," IEEE Signal Processing Magazine, 2009.

---

## 👥 Contributors

- **Chris King** — Core Architecture, Backend (Node.js/TypeScript), Multi-Tenant Platform Engine, Frontend (React 18), & Smart Contract Anchoring (Ethereum Sepolia).

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

Built with ❤️ using Node.js, React, TypeScript, IPFS & Ethereum Sepolia Solidity.