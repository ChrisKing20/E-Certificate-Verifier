"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const config_1 = require("../config");
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    if (statusCode >= 500) {
        console.error('❌ Server Error:', err);
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(config_1.config.nodeEnv === 'development' && statusCode >= 500 && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
