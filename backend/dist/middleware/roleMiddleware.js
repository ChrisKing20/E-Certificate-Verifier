"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.admin) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        const { role } = req.admin;
        // SUPER_ADMIN can access both SUPER_ADMIN and ADMIN routes
        if (role === 'SUPER_ADMIN') {
            next();
            return;
        }
        // ADMIN can access ADMIN routes, but NOT SUPER_ADMIN routes
        if (requiredRole === 'ADMIN' && role === 'ADMIN') {
            next();
            return;
        }
        res.status(403).json({
            success: false,
            message: 'Forbidden. Insufficient administrative privileges.',
        });
    };
};
exports.requireRole = requireRole;
