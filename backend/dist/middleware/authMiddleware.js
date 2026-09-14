"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const Admin_1 = require("../models/Admin");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Authentication required. Authorization token is missing.',
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        const adminId = decoded.adminId || decoded.id;
        if (!adminId) {
            res.status(401).json({ success: false, message: 'Invalid token payload.' });
            return;
        }
        const admin = await Admin_1.Admin.findById(adminId);
        if (!admin || !admin.isActive) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized. Administrator account is inactive or no longer exists.',
            });
            return;
        }
        req.admin = {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized. Invalid or expired authentication token.',
        });
        return;
    }
};
exports.authMiddleware = authMiddleware;
