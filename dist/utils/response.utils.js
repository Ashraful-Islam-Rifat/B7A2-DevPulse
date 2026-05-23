"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = void 0;
const sendSuccess = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({
        success: true,
        message,
        ...(data !== null && { data })
    });
};
exports.sendSuccess = sendSuccess;
