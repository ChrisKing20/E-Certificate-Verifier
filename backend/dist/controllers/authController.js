"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogin = void 0;
const authService_1 = require("../services/authService");
const handleLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
            return;
        }
        const result = await (0, authService_1.loginAdmin)(email, password);
        res.status(200).json({
            success: true,
            message: 'Admin authentication successful.',
            token: result.token,
            admin: result.admin,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.handleLogin = handleLogin;
