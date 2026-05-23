"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIssueCreation = exports.validateLogin = exports.validateSignup = void 0;
const http_status_codes_1 = require("http-status-codes");
const app_error_js_1 = require("../utils/app-error.js");
const validateSignup = (req, res, next) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Validation errors', 'Name, email, and password fields are strictly required');
    }
    if (role && !['contributor', 'maintainer'].includes(role)) {
        throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Validation errors', 'Role parameters must accurately match contributor or maintainer');
    }
    next();
};
exports.validateSignup = validateSignup;
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Validation errors', 'Email and password elements are strictly mandatory');
    }
    next();
};
exports.validateLogin = validateLogin;
const validateIssueCreation = (req, res, next) => {
    const { title, description, type } = req.body;
    if (!title || !description || !type) {
        throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Validation errors', 'Title, description, and type values are mandatory');
    }
    if (title.length > 150) {
        throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Validation errors', 'Title footprint must not exceed 150 configurations');
    }
    if (description.length < 20) {
        throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Validation errors', 'Description must yield a length footprint of minimum 20 elements');
    }
    if (!['bug', 'feature_request'].includes(type)) {
        throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Validation errors', "Type categorizations must follow 'bug' or 'feature_request'");
    }
    next();
};
exports.validateIssueCreation = validateIssueCreation;
