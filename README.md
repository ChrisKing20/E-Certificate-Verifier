# 📜 E-Certificate Verifier

🛡️ **E-Certificate Verifier**  
*Tamper-Proof Academic & Digital Event Credential Verification System*

---

A multi-layered defense system combining institutional database lookup, SHA-256 cryptographic PDF hashing, dynamic QR code verification, and smart contract anchoring on Ethereum Sepolia — built for academic institutions, colleges, and event issuers.

---
## 📋 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Migration & Live Setup (Cloud & Sepolia)](#-migration--live-setup-cloud--sepolia)
- [Getting Started](#-getting-started)
- [Smart Contract](#-smart-contract)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [MongoDB Setup & Admin Seeding](#-mongodb-setup--admin-seeding)
- [Contributors](#-contributors)
- [License](#-license)

---

## 🔍 Overview

Academic and event credential fraud is a growing challenge. Traditional paper and standard PDF digital certificates rely on easily spoofed visual elements, leaving critical security vulnerabilities. **E-Certificate Verifier** introduces a defense-in-depth strategy with four sequential verification layers:

| Layer | Technology | What It Catches |
| :--- | :--- | :--- |
| 🔍 **Layer 1** | **Unique Certificate ID Registry** | Non-existent, fabricated, or invalid certificate ID numbers |
| 🔐 **Layer 2** | **SHA-256 Cryptographic Hash** | Post-issuance PDF document tampering, text edits, or pixel alterations |
| 📱 **Layer 3** | **Dynamic QR Code Payload** | Fake certificate URLs, forged physical prints, or unverified scan codes |
| ⛓️ **Layer 4** | **Ethereum Sepolia Blockchain Anchor** | Centralized database tampering, backdated entries, & unauthorized record deletions |

The system fails fast — if Layer 1 or Layer 2 detects a non-registered or altered document hash, subsequent steps provide immediate audit feedback without delay.

---

## ✨ Key Features

- 🔒 **Cryptographic Integrity** — Real-time SHA-256 binary hash generation & instant signature matching for uploaded PDF certificates.
- ⛓️ **Blockchain Immutability** — On-chain certificate hash registration on Ethereum Sepolia Testnet via Solidity `CertificateRegistry` smart contract formatted as `bytes32`.
- 📱 **Multi-Mode Verification** — Instant public verification via Unique ID lookup (`ECV-2026-XXXXXX`), file upload, or camera-based live QR scanning (`html5-qrcode`).
- 🎓 **Institutional Admin Portal** — Secure issuance workflow featuring recipient metadata management, automated QR code creation, official revocation handling, and manual blockchain retry capabilities.
- 📊 **Audit Trail & Query Logging** — Comprehensive logging of all verification requests (storing IP address, user agent, response duration, and duplicate verification warnings).
- 🌐 **Modern Dashboard UI** — Dark-themed, highly responsive React 18 interface built with Vite, TypeScript, Tailwind CSS v4, Lucide icons, and celebratory confetti effects.

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
       |                        Frontend (React 18 + Vite)                     |
       +-----------------------------------+-----------------------------------+
                                           | HTTP / REST
                                           v
       +-----------------------------------------------------------------------+
       |                  Backend Server (Node.js + Express + TS)              |
       |                                                                       |
       |  +--------------------+  +--------------------+  +-----------------+  |
       |  |  SHA-256 Crypto    |  |  Multer 10MB PDF   |  |   QR Generator  |  |
       |  +--------------------+  +--------------------+  +-----------------+  |
       +-----------------+-----------------------------------+-----------------+
                         |                                   |
                         v                                   v
       +-----------------------------------+   +-------------------------------+
       |    MongoDB Atlas (Mongoose ODM)   |   |  Ethereum Sepolia Blockchain  |
       |  - Certificates & Revocations     |   |  - Solidity Smart Contract    |
       |  - Verification Audit Logs        |   |  - CertificateRegistry.sol    |
       +-----------------------------------+   +-------------------------------+
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
| :--- | :--- |
| **Node.js (v20+)** | Backend server runtime environment |
| **Express.js** | RESTful API framework |
| **TypeScript** | Type-safe backend development |
| **MongoDB Atlas + Mongoose** | Document database & Object Data Modeling (ODM) |
| **JWT & Bcrypt** | Institutional admin authentication & password hashing |
| **Node Crypto** | Native SHA-256 hash generation for PDF binary streams |
| **Multer** | Multipart form data file uploader (10MB PDF limit) |
| **QRCode** | Server-side QR code rendering for certificate embedding |
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
| **html5-qrcode** | Real-time web camera QR scanner |
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

## 🚀 Migration & Live Setup (Cloud & Sepolia)

> **Branch:** `feature/cloud-mongo-and-sepolia`

### Live Infrastructure Status
1. 🍃 **Database**: Connected to **MongoDB Atlas** cloud cluster.
2. ⛓️ **Blockchain**: Smart contract compiled & deployed to **Ethereum Sepolia Testnet**.
3. 🔍 **Etherscan Verified Code**: Verified on Sepolia Etherscan.

### Live Deployed Smart Contract Details
- **Contract Name**: `CertificateRegistry` (Solidity 0.8.20, OpenZeppelin Ownable)
- **Network**: Ethereum Sepolia Testnet (Chain ID: `11155111` / `0xaa36a7`)
- **Contract Address**: [`0xcd70a18caa8b0cc879680e5f8B078577D64ce9de`](https://sepolia.etherscan.io/address/0xcd70a18caa8b0cc879680e5f8B078577D64ce9de)
- **Deployment Transaction**: [`0xbf3d0284ebccad26826710b9a21524fb7d93014fa692903d34b63e62c54989ed`](https://sepolia.etherscan.io/tx/0xbf3d0284ebccad26826710b9a21524fb7d93014fa692903d34b63e62c54989ed)
- **Etherscan Verification**: [View Verified Contract on Etherscan](https://sepolia.etherscan.io/address/0xcd70a18caa8b0cc879680e5f8B078577D64ce9de#code)

### Summary of Critical Fixes Included
- **Route Mismatch Fix**: Added missing admin endpoints (`/certificates/:id`, `/certificates/:id/revoke`, `/certificates/:id/blockchain`) to prevent HTML 404 JSON parsing errors.
- **Mongoose CastError Fix**: Implemented `findCertificateByIdOrCertId` helper to prevent ObjectId casting errors when querying custom certificate IDs like `ECV-2026-000001`.
- **macOS Port 5000 AirPlay Conflict Fix**: Shifted backend default port to **`5001`** (frontend updated to point to `http://localhost:5001/api`).

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

### 2️⃣ Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Seed institutional administrator account
npm run seed

# Start development backend server (Port 5001)
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
The frontend dashboard runs at `http://localhost:5173`

---

### 4️⃣ Blockchain Setup (Optional - Smart Contract is already live!)
The smart contract is **already deployed and live on Sepolia** at `0xcd70a18caa8b0cc879680e5f8B078577D64ce9de`. 

If you want to deploy your own custom contract instance:

```bash
# Open a new terminal and navigate to blockchain directory
cd blockchain

# Install dependencies
npm install

# Compile Solidity smart contract
npm run compile

# Configure blockchain .env with Sepolia RPC URL & Private Key
cp .env.example .env

# Deploy CertificateRegistry.sol to Ethereum Sepolia Testnet
npm run deploy:sepolia
```

---

### 5️⃣ Environment Variables

#### Backend Configuration (`backend/.env`)
```env
PORT=5001
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.t9ivs.mongodb.net/ecertificate?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="ecert-verifier-super-secret-jwt-key-2026-phase2"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"

# ── Blockchain Config (Ethereum Sepolia) ──
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
BLOCKCHAIN_PRIVATE_KEY="your-wallet-private-key"
CONTRACT_ADDRESS="0xcd70a18caa8b0cc879680e5f8B078577D64ce9de"
```

#### Frontend Configuration (`frontend/.env`)
```env
VITE_API_BASE_URL="http://localhost:5001/api"
VITE_CONTRACT_ADDRESS="0xcd70a18caa8b0cc879680e5f8B078577D64ce9de"
```

#### Blockchain Configuration (`blockchain/.env`)
```env
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
BLOCKCHAIN_PRIVATE_KEY="your-wallet-private-key"
ETHERSCAN_API_KEY="your-etherscan-api-key"
CONTRACT_ADDRESS="0xcd70a18caa8b0cc879680e5f8B078577D64ce9de"
```

---

## 🎯 Quick Start (TL;DR)

```bash
# Terminal 1 — Backend & Database Seed
cd backend && npm install && npm run seed && npm run dev

# Terminal 2 — Frontend UI
cd frontend && npm install && npm run dev

# Open http://localhost:5173 in browser
```

---

## 🍃 MongoDB Setup & Admin Seeding

To seed the MongoDB database with the initial institutional administrator account:

```bash
cd backend
npm run seed
```

### 🔑 Default Administrator Credentials
- **Email**: `admin@ecertificate.local`
- **Password**: `Admin@123` *(Bcrypt hashed in MongoDB)*

---

## ⛓️ Smart Contract

- **Network**: Ethereum Sepolia Testnet (Chain ID: `11155111`)
- **Deployed Address**: [`0xcd70a18caa8b0cc879680e5f8B078577D64ce9de`](https://sepolia.etherscan.io/address/0xcd70a18caa8b0cc879680e5f8B078577D64ce9de#code)
- **Language**: Solidity 0.8.20
- **Source**: [`blockchain/contracts/CertificateRegistry.sol`](blockchain/contracts/CertificateRegistry.sol)

| Function | Type | Description |
| :--- | :--- | :--- |
| `registerCertificate(certificateId, certificateHash)` | Write | Anchor SHA-256 certificate hash (as `bytes32`) on-chain |
| `verifyCertificate(certificateId, certificateHash)` | Read | Verify validity & hash matching status on-chain |
| `revokeCertificate(certificateId, reason)` | Write | Revoke a certificate record on-chain with official reason |
| `isCertificateRegistered(certificateId)` | Read | Check if a certificate ID is registered on-chain |
| `getCertificate(certificateId)` | Read | Retrieve on-chain details (issuer, timestamp, hash, revocation status) |
| `getCertificateCount()` | Read | Get total number of certificates registered on-chain |

---

## 📡 API Reference

### 🔓 Public Verification Endpoints
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Admin authentication & JWT token issuance | ❌ |
| `GET` | `/api/verify/number/:certificateId` | Verify certificate by ID (e.g. `ECV-2026-001245`) | ❌ |
| `POST` | `/api/verify/pdf` | Verify by PDF upload (calculates SHA-256 hash) | ❌ |
| `GET` | `/api/health` | Backend service health check & system status | ❌ |

### 🔐 Protected Admin Endpoints *(Requires `Authorization: Bearer <JWT>`)*
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard/stats` | Fetch real database statistics & metrics | 🔐 |
| `GET` | `/api/admin/certificates` | Search, filter & paginate certificate registry | 🔐 |
| `POST` | `/api/certificates` | Issue new certificate with PDF upload & QR generation | 🔐 |
| `GET` | `/api/admin/certificates/:id` | Get detailed certificate record & audit logs | 🔐 |
| `PATCH` | `/api/admin/certificates/:id/revoke` | Revoke certificate with official reason | 🔐 |
| `POST` | `/api/admin/certificates/:id/blockchain/register` | Manually retry blockchain registration | 🔐 |
| `GET` | `/api/admin/verification-logs` | View public verification query logs | 🔐 |

---

## 📁 Project Structure

```
E-Certificate-Verifier/
├── 🔧 backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                   # Mongoose MongoDB Connection
│   │   ├── controllers/
│   │   │   ├── adminController.ts      # Dashboard stats & admin operations
│   │   │   ├── authController.ts       # JWT Auth & login handler
│   │   │   ├── certificateController.ts # Issuance, list & revocation handlers
│   │   │   └── verificationController.ts # Public number & PDF verification
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts       # JWT authentication guard
│   │   │   ├── errorHandler.ts         # Express global error handler
│   │   │   ├── rateLimiter.ts          # Endpoint rate limiters
│   │   │   └── uploadMiddleware.ts     # Multer 10MB uploader
│   │   ├── models/
│   │   │   ├── Admin.ts                # Mongoose Admin Model
│   │   │   ├── Certificate.ts          # Mongoose Certificate Model
│   │   │   └── VerificationLog.ts      # Mongoose Audit Log Model
│   │   ├── routes/
│   │   │   ├── adminRoutes.ts          # Admin Dashboard routes
│   │   │   ├── authRoutes.ts           # Authentication routes
│   │   │   ├── certificateRoutes.ts    # Certificate Management routes
│   │   │   └── verificationRoutes.ts   # Public verification routes
│   │   ├── services/
│   │   │   ├── authService.ts          # Auth business logic
│   │   │   ├── blockchainService.ts    # Sepolia Ethers.js integration
│   │   │   ├── certificateService.ts   # Certificate CRUD logic
│   │   │   ├── dashboardService.ts     # Dashboard metrics aggregator
│   │   │   ├── qrService.ts            # QR Code generator service
│   │   │   └── verificationService.ts  # Cryptographic hash verification logic
│   │   ├── utils/
│   │   │   └── hashFile.ts             # Crypto SHA-256 utility
│   │   ├── app.ts                      # Express app middleware setup
│   │   ├── seed.ts                     # Database seed script
│   │   └── server.ts                   # HTTP Server entry point
│   ├── uploads/                        # Document uploads & generated QR codes
│   ├── .env
│   └── package.json
│
├── ⛓️ blockchain/
│   ├── contracts/
│   │   └── CertificateRegistry.sol     # Solidity 0.8.20 Smart Contract
│   ├── scripts/
│   │   └── deploy.ts                   # Sepolia deployment script
│   ├── test/                       # Hardhat contract unit tests
│   ├── hardhat.config.ts               # Hardhat network configuration
│   └── package.json
│
├── 🎨 frontend/
│   ├── src/
│   │   ├── components/                 # UI Components (Navbar, Cards, StatusBadge, etc.)
│   │   ├── context/                    # Auth Context Provider
│   │   ├── pages/                      # Page Views (Home, Verify, Admin Dashboard)
│   │   ├── routes/                     # Router Configuration & Guards
│   │   ├── services/                   # Axios API service handlers
│   │   ├── App.tsx                     # Main React application component
│   │   └── main.tsx                    # React DOM entry point
│   ├── index.html                      # HTML template
│   └── package.json
│
├── .gitignore
├── README.md                           # Main Project README
├── UPDATED_README.md                   # Migration Summary
└── package.json
```

---

## 👥 Contributors

- **Chris King** — Core Architecture, Backend (Node.js/TypeScript), Frontend (React 18), & Blockchain Smart Contract (Ethereum Sepolia)

---

## 📄 License

This project is developed as an academic major project and research implementation.  
For production or institutional adoption, perform a security review, key management hardening, and infrastructure-level compliance checks.