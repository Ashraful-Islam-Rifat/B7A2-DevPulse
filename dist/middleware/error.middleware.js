"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const app_error_js_1 = require("../utils/app-error.js");
const http_status_codes_1 = require("http-status-codes");
const errorHandler = (err, req, res, next) => {
    if (err instanceof app_error_js_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.errors && { errors: err.errors })
        });
        return;
    }
    // Handle unique database constraints
    if ('code' in err && err.code === '23505') {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Resource or entry already exists',
            errors: err.message
        });
        return;
    }
    console.error('💥 Critical Error Triggered:', err);
    res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Unexpected server or database error',
        errors: process.env.NODE_ENV === 'development' ? err.message : null
    });
};
exports.errorHandler = errorHandler;
