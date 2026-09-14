"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFileSHA256 = exports.calculateSHA256 = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
/**
 * Computes SHA-256 cryptographic hash from a file Buffer
 */
const calculateSHA256 = (buffer) => {
    return crypto_1.default.createHash('sha256').update(buffer).digest('hex');
};
exports.calculateSHA256 = calculateSHA256;
/**
 * Computes SHA-256 cryptographic hash from a file path on disk
 */
const calculateFileSHA256 = async (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto_1.default.createHash('sha256');
        const stream = fs_1.default.createReadStream(filePath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
};
exports.calculateFileSHA256 = calculateFileSHA256;
