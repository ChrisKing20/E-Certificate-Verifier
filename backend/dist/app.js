"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const certificateRoutes_1 = __importDefault(require("./routes/certificateRoutes"));
const verificationRoutes_1 = __importDefault(require("./routes/verificationRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Initialize MongoDB Connection via Mongoose
(0, db_1.connectDB)();
// Security Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, cors_1.default)({
    origin: [config_1.config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
// Body Parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve Uploads Directory statically
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/certificates', certificateRoutes_1.default);
app.use('/api/verify', verificationRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Root Endpoint
app.get('/', (_req, res) => {
    res.status(200).json({
        message: '🚀 E-Certificate Verifier Backend API is running.',
        frontendUrl: 'http://localhost:5173',
        healthCheck: 'http://localhost:5000/api/health',
        status: 'ACTIVE',
    });
});
// Health Check Endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'UP',
        database: 'MongoDB (Mongoose)',
        message: 'E-Certificate Verifier Backend Service is running smoothly.',
        timestamp: new Date().toISOString(),
    });
});
// Central Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
