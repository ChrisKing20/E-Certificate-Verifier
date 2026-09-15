# 🚀 Migration & Changes Guide: Local to Cloud & Sepolia

> **Branch:** `feature/cloud-mongo-and-sepolia`  
> **Target:** `main` (kept clean and untouched)  
> **Date:** September 2026  

---

## 📌 Executive Summary

This document explains all updates, migrations, and bug fixes made to transition the **E-Certificate Verifier** project from a purely local, terminal-based setup (`localhost:8545` Hardhat node and local MongoDB) to **live cloud infrastructure**:

1. 🍃 **Database**: Connected to **MongoDB Atlas** cloud cluster.
2. ⛓️ **Blockchain**: Migrated and deployed the smart contract to **Ethereum Sepolia Testnet**.
3. 🔍 **Contract Verification**: Automatically verified source code on **Sepolia Etherscan**.
4. 🛠️ **Bug Fixes**: Resolved route mismatches, Mongoose CastErrors, and port collisions.
5. 📝 **Documentation**: Added comprehensive inline guides to all `.env` files.

---

## ⛓️ 1. Blockchain Migration (Sepolia Testnet & Etherscan)

### Live Smart Contract Deployment
- **Contract Name**: `CertificateRegistry` (Solidity 0.8.20, OpenZeppelin Ownable)
- **Network**: Ethereum Sepolia Testnet (Chain ID: `11155111` / `0xaa36a7`)
- **Contract Address**: [`0xcd70a18caa8b0cc879680e5f8B078577D64ce9de`](https://sepolia.etherscan.io/address/0xcd70a18caa8b0cc879680e5f8B078577D64ce9de)
- **Deployment Transaction**: [`0xbf3d0284ebccad26826710b9a21524fb7d93014fa692903d34b63e62c54989ed`](https://sepolia.etherscan.io/tx/0xbf3d0284ebccad26826710b9a21524fb7d93014fa692903d34b63e62c54989ed)
- **Etherscan Verified Code**: [View Verified Contract on Etherscan](https://sepolia.etherscan.io/address/0xcd70a18caa8b0cc879680e5f8B078577D64ce9de#code)

### Code Changes in `blockchain/`
1. **`blockchain/hardhat.config.ts`**:
   - Added the `etherscan` configuration object to support automated verification via `@nomicfoundation/hardhat-toolbox`:
     ```typescript
     etherscan: {
       apiKey: process.env.ETHERSCAN_API_KEY || "",
     },
     ```
2. **`blockchain/.env` & `blockchain/.env.example`**:
   - Added detailed comments explaining how to get free Infura/Alchemy RPC endpoints, how to export a MetaMask private key, where to get Sepolia faucet ETH, and how to create a free Etherscan API key.

---

## 🍃 2. MongoDB Cloud Migration (MongoDB Atlas)

- Replaced local connection string (`mongodb://localhost:27017/ecertificate`) with **MongoDB Atlas SRV URI**:
  ```env
  MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.t9ivs.mongodb.net/ecertificate?retryWrites=true&w=majority&appName=Cluster0"
  ```
- **Admin Seeding**:
  - Ran `cd backend && npm run seed` against MongoDB Atlas.
  - Successfully provisioned the default institutional administrator account:
    - **Email**: `admin@ecertificate.local`
    - **Password**: `Admin@123`

---

## 🐛 3. Critical Bug Fixes in Backend Code

### Issue A: Route Mismatch Causing `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- **What happened**:
  - In `frontend/src/services/certificateApi.ts`, the frontend made calls to `/admin/certificates/:id/blockchain`, `/admin/certificates/:id`, and `/admin/certificates/:id/revoke`.
  - In `backend/src/routes/adminRoutes.ts`, these routes did **not exist** (only `dashboard/stats`, `certificates` GET, and `verification-logs` were defined).
  - Express responded with a standard **404 HTML document** (`<!DOCTYPE html><title>Error</title>Cannot PATCH...`).
  - When the browser tried to parse this HTML error as JSON (`response.json()`), it crashed with:
    `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.
- **Fix in `backend/src/routes/adminRoutes.ts`**:
  - Added the missing handlers to `adminRoutes.ts`:
    ```typescript
    // GET /api/admin/certificates/:id
    router.get('/certificates/:id', handleGetCertificateById);

    // PATCH /api/admin/certificates/:id/revoke
    router.patch('/certificates/:id/revoke', handleRevokeCertificate);

    // PATCH /api/admin/certificates/:id/blockchain
    router.patch('/certificates/:id/blockchain', handleUpdateBlockchainMetadata);
    ```

---

### Issue B: Mongoose CastError on Custom Certificate IDs
- **What happened**:
  - In `backend/src/services/certificateService.ts`, methods searched for certificates using:
    `Certificate.findOne({ $or: [{ _id: id }, { certificateId: id }] })`
  - When `id` was a certificate string (e.g. `ECV-2026-000001`) instead of a 24-character hexadecimal ObjectId, Mongoose attempted to cast it to an `ObjectId` for the `_id` field, throwing:
    `CastError: Cast to ObjectId failed for value "ECV-2026-000001" at path "_id"`
- **Fix in `backend/src/services/certificateService.ts`**:
  - Added a type-safe helper `findCertificateByIdOrCertId`:
    ```typescript
    export const findCertificateByIdOrCertId = async (id: string): Promise<ICertificate | null> => {
      if (mongoose.isValidObjectId(id)) {
        return Certificate.findOne({
          $or: [{ _id: id }, { certificateId: id }],
        });
      }
      return Certificate.findOne({ certificateId: id });
    };
    ```
  - Replaced all 4 vulnerable queries (`retryBlockchainRegistration`, `updateCertificateBlockchainMetadata`, `getCertificateById`, `revokeCertificate`) with this safe helper.

---

### Issue C: macOS Port 5000 AirPlay Conflict
- **What happened**:
  - On macOS Monterey/Ventura/Sonoma/Sequoia, Apple's `ControlCenter` reserves port `5000` for AirPlay Receiver (`EADDRINUSE: address already in use :::5000`).
- **Fix**:
  - Configured backend to run on port **`5001`** in `backend/.env`.
  - Updated `VITE_API_URL=http://localhost:5001/api` in `frontend/.env`.
  - Documented both options (port 5001 vs turning off AirPlay Receiver in System Settings) in `backend/.env.example`.

---

## 📂 4. Summary of Files Changed

| File | Type of Change | Description |
| :--- | :--- | :--- |
| [`blockchain/hardhat.config.ts`](file:///Users/ayon/Downloads/E-Certificate-Verifier/blockchain/hardhat.config.ts) | Modified | Added Etherscan verification plugin config (`etherscan.apiKey`) |
| [`blockchain/.env`](file:///Users/ayon/Downloads/E-Certificate-Verifier/blockchain/.env) | Modified | Added Sepolia Infura RPC, deployer key, and verified contract address |
| [`blockchain/.env.example`](file:///Users/ayon/Downloads/E-Certificate-Verifier/blockchain/.env.example) | Modified | Added complete guide for where to get RPC, keys, and faucet ETH |
| [`backend/src/routes/adminRoutes.ts`](file:///Users/ayon/Downloads/E-Certificate-Verifier/backend/src/routes/adminRoutes.ts) | Modified | Added missing admin certificate endpoints (`:id`, `:id/revoke`, `:id/blockchain`) |
| [`backend/src/services/certificateService.ts`](file:///Users/ayon/Downloads/E-Certificate-Verifier/backend/src/services/certificateService.ts) | Modified | Implemented safe query helper to prevent Mongoose `CastError` on certificate IDs |
| [`backend/.env`](file:///Users/ayon/Downloads/E-Certificate-Verifier/backend/.env) | Modified | Switched to port 5001, Atlas cloud URI, Sepolia RPC & deployed contract address |
| [`backend/.env.example`](file:///Users/ayon/Downloads/E-Certificate-Verifier/backend/.env.example) | Modified | Added detailed instructions for Atlas setup, IP whitelist, and keys |
| [`frontend/.env`](file:///Users/ayon/Downloads/E-Certificate-Verifier/frontend/.env) | Modified | Updated to port 5001 API URL and Sepolia contract address |
| [`frontend/.env.example`](file:///Users/ayon/Downloads/E-Certificate-Verifier/frontend/.env.example) | Modified | Added explanation of frontend environment variables |
| `UPDATED_README.md` | **New** | This migration summary guide |

---

## 🚀 5. How to Run the Project Moving Forward

The smart contract is **already deployed and live on Ethereum Sepolia**. You do not need to run Hardhat locally anymore!
 ### One time setup/frist if you want new block or want to seed a new db
 ```bash
cd blockchain
npm run deploy:sepolia
 ```
then copy the contract address and paste it in frontend/.env and backend/.env
then run this command in backend folder to seed a new db if needed (it will create a new db) once only needed in whole life!
```bash
cd backend
npm run seed
```
now the new db is ready for you to use!
everyda flow 
### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
*Runs on `http://localhost:5001` and connects to MongoDB Atlas.*

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
*Runs on `http://localhost:5173`.*

### Step 3: Admin Login
- Open: [http://localhost:5173/login](http://localhost:5173/login)
- **Email**: `admin@ecertificate.local`
- **Password**: `Admin@123`

---

## 🔒 6. Git Branch Information

All of these updates exist on branch:
```bash
git checkout feature/cloud-mongo-and-sepolia
```
The `main` branch has zero commits or unstaged modifications. When your friend reviews this document and tests the feature branch, he can merge it cleanly into `main`:
```bash
git checkout main
git merge feature/cloud-mongo-and-sepolia
```
