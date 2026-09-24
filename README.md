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
- [Phase 6 Testing, Performance & Security Documentation](#-phase-6-testing-performance--security-documentation)
- [Project Structure](#-project-structure)
- [Contributors](#-contributors)
- [References](#-references)
- [License](#-license)

---

## 🔍 Overview

Academic and digital credential fraud is a critical global challenge. Traditional single-tenant verification systems rely on basic database lookups or visual design checks, leaving severe vulnerabilities against document alteration or database tampering. **E-Cert-Verifier** introduces a defense-in-depth strategy with **five sequential verification layers**:

| Layer | Technology | What It Catches |
| :--- | :--- | :--- |
| 🔍 **Layer 1** | **Unique Certificate ID & Institutional Registry** | Non-existent, fabricated, or unapproved institutional certificate IDs |
| 🔐 **Layer 2** | **SHA-256 Cryptographic Stream Hash** | Post-issuance PDF document tampering, text edits, or pixel alterations |
| 📱 **Layer 3** | **Dynamic QR Code & Payload Verification** | Fake certificate URLs, forged physical prints, or unverified scan codes |
| 📦 **Layer 4** | **IPFS Decentralized File Storage & CID Immutability** | Centralized file server loss, single-point-of-failure storage tampering, & altered PDF payloads |
| ⛓️ **Layer 5** | **Ethereum Sepolia Blockchain Anchor** | Centralized database tampering, backdated entries, & unauthorized record deletions |

The verification pipeline fails fast — if Layer 1 or Layer 2 detects a non-registered or altered document hash, subsequent steps provide immediate audit feedback without delay.

---

## ✨ Key Features

- 🏢 **Multi-Tenant Institutional Platform** — Isolated data per institution (`Institution A`, `Institution B`), preventing cross-tenant access to certificates, metrics, or user logs.
- 👑 **Super Admin Onboarding Approval** — DB-backed institution onboarding flow (`PENDING` -> Super Admin Approval -> `ACTIVE`). Admins cannot log in until their institution is approved.
- 🔑 **Multi-Role Authentication & OAuth** — Secure Email/Password and Google OAuth (`Continue with Google`) for Students (`USER`), Institutional Administrators (`ADMIN`), and System Super Admins (`SUPER_ADMIN`).
- 🔒 **Cryptographic Integrity & SHA-256** — Real-time SHA-256 binary hash generation & instant signature matching for uploaded PDF certificates.
- 📦 **IPFS Decentralized Storage** — Automatic PDF file pinning to IPFS via Pinata SDK with fallback local storage, deterministic CIDs, and multi-gateway resolution (`ipfs.io`, `dweb.link`, `cloudflare-ipfs.com`).
- ⛓️ **Ethereum Sepolia Blockchain Anchor** — On-chain certificate hash registration via Solidity `CertificateRegistry.sol` contract formatted as `bytes32` primitives.
- 📱 **Multi-Modal Verification** — Instant public verification via Unique ID lookup (`ECV-2026-XXXXXX`), file upload SHA-256 hashing, or live camera QR scanning.
- 📊 **Role-Based Analytics Dashboards** — Dedicated Student Dashboard (`/dashboard`), Institution Admin Console (`/admin/dashboard`), and Platform Super Admin Console (`/superadmin/dashboard`).

---

## 🏗️ Architecture

```
                                  +-------------------+
                                  | Public / Verifier |
                                  +---------+---------+
                                            |
                  +-------------------------+-------------------------+
                  |                         |                         |
          +-------v-------+         +-------v-------+         +-------v-------+
          |  Upload PDF   |         |    Scan QR    |         |   Unique ID   |
          +-------+-------+         +-------+-------+         +-------+-------+
                  |                         |                         |
                  +-------------------------+-------------------------+
                                            |
                                            v
                      +-------------------------------------------+
                      |        E-Cert-Verifier Frontend           |
                      |   (React 18 + Vite + TypeScript)          |
                      +---------------------+---------------------+
                                            | HTTP / REST
                                            v
                      +-------------------------------------------+ <--- CID ---+
                      |         E-Cert-Verifier Backend           |             |
                      |     (Node.js + Express + TypeScript)      |             |
                      +--+--------------+---------------+------+--+             |
                         |              |               |      |                |
             +-----------+              |               |      +----------+     |
             |                          |               |                 |     |
             v                          v               v                 v     |
   /-------------------\      /-------------------\  Store Cert   /---------------\
  /       SHA-256       \    /   QR Code Engine    \ ----------> /  IPFS Pinata    \
 <  Certificate Hashing  >  < Generation & Parsing >            <   SDK Document    >
  \                     /    \                     /               \   Pinning     /
   \---------+---------/      \---------+---------/                 \-----+-------/
             |                          |                                 |     |
    Write    | Hash +                   | Store                           | Pin | CID
   On-Chain  | Metadata                 | Certificate                     | PDF |
             v                          v                                 v     |
+------------+------------+  +----------+----------+        +-------------+-----+----+
| Ethereum Sepolia Network|  | MongoDB Atlas Cloud     |        | IPFS Gateway / Pinata    |
| CertRegistry.sol        |  | Multi-Tenant Users,     |        | Immutable Certificate    |
| On-Chain Verification   |  | Certificates & Logs     |        | CID PDF Storage          |
+------------+------------+  +----------+----------+        +--------------------------+
             |                          |
   Verify    |                          | Read Verification Record
  Transaction|                          |
             v                          v
      +------+--------------------------+------+
      |      Certificate Verified / Invalid    |
      +----------------------------------------+
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
| **Pinata IPFS SDK** | Decentralized certificate storage, pinning & gateway resolution |
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
JWT_SECRET="YOUR_JWT_SECRET_KEY"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"

# ── IPFS Storage Provider (Pinata) ──
IPFS_GATEWAY_URL="https://gateway.pinata.cloud/ipfs/"
IPFS_JWT="YOUR_PINATA_JWT_TOKEN"

# ── Blockchain Integration (Ethereum Sepolia) ──
CONTRACT_ADDRESS="YOUR_SEPOLIA_CONTRACT_ADDRESS"
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"

# ── Google OAuth Configuration ──
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"
FRONTEND_URL="http://localhost:5173"

# ── Super Admin Bootstrap Credentials ──
SUPER_ADMIN_NAME="Platform Super Admin"
SUPER_ADMIN_EMAIL="admin@yourdomain.org"
SUPER_ADMIN_PASSWORD="YOUR_SECURE_SUPER_ADMIN_PASSWORD"
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

### IPFS Decentralized Storage Architecture
- **Provider**: Pinata IPFS API with fallback deterministic content-addressed hashing (`bafkrei...`).
- **Gateway Resolution**: Multi-gateway fetch fallback (`ipfs.io`, `dweb.link`, `cloudflare-ipfs.com`) ensuring file availability.
- **Service File**: [`backend/src/services/ipfsService.ts`](backend/src/services/ipfsService.ts)

### Smart Contract Specification
- **Network**: Ethereum Sepolia Testnet (Chain ID: `11155111`)
- **Smart Contract Framework**: Solidity 0.8.20 + OpenZeppelin Contracts v5 (`Ownable`)
- **Source File**: [`blockchain/contracts/CertificateRegistry.sol`](blockchain/contracts/CertificateRegistry.sol)
- **Data Privacy Guarantee**: Stores strictly cryptographic metadata (`certificateId`, `bytes32` SHA-256 hash, issuer wallet, timestamps, revocation status). No personal details or raw PDF files are stored on-chain.

| Function | Type | Modifier | Description |
| :--- | :--- | :--- | :--- |
| `registerCertificate(certificateId, certificateHash)` | Write | `onlyOwner` | Anchor SHA-256 certificate hash (as `bytes32`) on-chain |
| `verifyCertificate(certificateId, certificateHash)` | Read | `view` | Verify certificate hash match & revocation status on-chain |
| `revokeCertificate(certificateId, reason)` | Write | `onlyOwner` | Revoke a certificate record on-chain with official reason |
| `isCertificateRegistered(certificateId)` | Read | `view` | Check if a certificate ID is registered on-chain |
| `getCertificate(certificateId)` | Read | `view` | Retrieve on-chain details (issuer, timestamp, hash, revocation) |
| `getCertificateCount()` | Read | `view` | Get total number of certificates registered on-chain |

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

## 🧪 Phase 6 Testing, Performance & Security Documentation

All Phase 6 research deliverables, performance benchmarks, and security reports are stored in the [`docs/`](docs/) directory:

- 📊 [`docs/experiment-results.csv`](docs/experiment-results.csv) — Empirical dataset measuring SHA-256 hashing speed, MongoDB query latency, and IPFS lookup overhead across file sizes (100KB to 10MB).
- 🧪 [`docs/testing-report.md`](docs/testing-report.md) — Comprehensive end-to-end test suite summary (100% pass rate across 89 test cases).
- ⚡ [`docs/performance-report.md`](docs/performance-report.md) — Hashing latency, verification response times, and database query scalability analysis.
- 🛡️ [`docs/security-report.md`](docs/security-report.md) — Threat model, PDF magic-byte validation (`%PDF-`), filename sanitization, and secret protection policies.
- 🔬 [`docs/research-methodology.md`](docs/research-methodology.md) — Research answers (RQ1–RQ7) on cryptographic hash integrity and multi-tenant performance.
- 🏢 [`docs/multi-tenant-testing.md`](docs/multi-tenant-testing.md) — Institutional data boundary isolation test cases and cross-tenant attack prevention.
- 🔐 [`docs/authentication-testing.md`](docs/authentication-testing.md) — Role-based access control matrix and Google OAuth security policies.

### Running Automated Test Suites

```bash
# Run Hardhat Smart Contract Tests
cd blockchain
npx hardhat test

# Run Backend Jest API & Integration Test Suite
cd backend
npm test

# Run Empirical Performance Benchmark Script
cd backend
npx ts-node src/scripts/runPerformanceBenchmarks.ts
```

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
│   │   ├── services/           # Business logic (IPFS, Blockchain, QR, Auth, Verification)
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
├── 📑 docs/                    # Phase 6 empirical research, security & benchmark reports
│   ├── authentication-testing.md
│   ├── experiment-results.csv
│   ├── multi-tenant-testing.md
│   ├── performance-report.md
│   ├── research-methodology.md
│   ├── security-report.md
│   └── testing-report.md
│
├── LICENSE                     # MIT License
├── README.md                   # Main Documentation
└── package.json
```

---

## 📚 References

Comprehensive academic literature survey and theoretical foundation used for the E-Cert-Verifier system architecture:

1. **G. Zyskind, O. Nathan, and A. S. Pentland**, "Decentralizing privacy: Using blockchain to protect personal data," in *IEEE Security and Privacy Workshops (SPW)*, San Jose, CA, USA, 2015, pp. 180-184.
2. **A. A. S. Al-Rimy, M. A. A. Hassan, and M. A. Ismail**, "Secure verification of academic credentials using smart contracts and IPFS," *IEEE Access*, vol. 9, pp. 124500-124512, 2021.
3. **K. R. N. Swamy and B. V. A. Rao**, "Detection of digital document alteration via SHA-256 binary stream hashing," *Journal of Information Security and Applications*, vol. 58, p. 102789, 2021.
4. **M. Crosby, P. Pattanayak, S. Verma, and V. Kalyanaraman**, "Blockchain technology: Beyond bitcoin," *Applied Innovation*, vol. 2, no. 6-10, pp. 71-81, 2016.
5. **J. Benet**, "IPFS - Content Addressed, Versioned, P2P File System," *arXiv preprint arXiv:1407.3561*, 2014.
6. **S. Nakamoto**, "Bitcoin: A Peer-to-Peer Electronic Cash System," *Decentralized Business Review*, 2008.
7. **V. Buterin**, "A Next-Generation Smart Contract and Decentralized Application Platform," *Ethereum White Paper*, 2014.
8. **S. R. Babu et al.**, "Blockchain and hash-based certificate verification framework," in *Proc. ICSCSE*, pp. 45-52, 2022.
9. **J. Vidal et al.**, "Blockchain-based academic certificate management: integrity and revocation challenges," in *Proc. IEEE EDUCON*, pp. 112-119, 2020.
10. **H. Farid**, "Image and Document Forgery Detection: A Comprehensive Survey," *IEEE Signal Processing Magazine*, vol. 26, no. 2, pp. 16-25, 2009.

---

## 👥 Contributors

- **Chris King** — Core Architecture, Backend (Node.js/TypeScript), Multi-Tenant Platform Engine, Frontend (React 18), IPFS Pinata Service & Smart Contract Anchoring (Ethereum Sepolia).

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

Built with 😈 using Node.js, React, TypeScript, IPFS & Ethereum Sepolia Solidity.