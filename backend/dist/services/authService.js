"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAdmin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = require("../models/Admin");
const config_1 = require("../config");
const loginAdmin = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const admin = await Admin_1.Admin.findOne({ email: normalizedEmail });
    if (!admin) {
        throw { statusCode: 401, message: 'Invalid email or password.' };
    }
    if (!admin.isActive) {
        throw { statusCode: 401, message: 'Invalid email or password.' };
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
        throw { statusCode: 401, message: 'Invalid email or password.' };
    }
    const payload = {
        adminId: admin._id.toString(),
        role: admin.role,
    };
    const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, { expiresIn: '8h' });
    return {
        token,
        admin: {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role,
        },
    };
};
exports.loginAdmin = loginAdmin;
