"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecertificate';
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(MONGODB_URI);
        console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    }
    catch (error) {
        console.warn(`⚠️ MongoDB connection warning: ${error.message || 'Unable to connect to MongoDB server'}`);
        return null;
    }
};
exports.connectDB = connectDB;
