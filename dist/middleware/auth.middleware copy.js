"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const app_error_js_1 = require("../utils/app-error.js");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Missing, expired, or invalid JWT token');
    }
    const token = authHeader.replace('Bearer ', '').trim();
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(new app_error_js_1.AppError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Missing, expired, or invalid JWT token'));
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.FORBIDDEN, 'Valid token but insufficient role/permissions');
        }
        next();
    };
};
exports.authorize = authorize;
