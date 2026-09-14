"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRetryBlockchainRegister = exports.handleGetDashboardStats = void 0;
const dashboardService_1 = require("../services/dashboardService");
const certificateService_1 = require("../services/certificateService");
const handleGetDashboardStats = async (_req, res, next) => {
    try {
        const stats = await (0, dashboardService_1.getDashboardStats)();
        res.status(200).json({
            success: true,
            stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.handleGetDashboardStats = handleGetDashboardStats;
const handleRetryBlockchainRegister = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await (0, certificateService_1.retryBlockchainRegistration)(id);
        res.status(200).json({
            success: true,
            message: 'Blockchain registration retry completed.',
            certificate: result.certificate,
            blockchainResult: result.blockchainResult,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.handleRetryBlockchainRegister = handleRetryBlockchainRegister;
