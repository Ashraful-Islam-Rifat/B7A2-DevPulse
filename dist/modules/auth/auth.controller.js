"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const http_status_codes_1 = require("http-status-codes");
const auth_service_js_1 = require("./auth.service.js");
const app_error_js_1 = require("../../utils/app-error.js");
const response_utils_js_1 = require("../../utils/response.utils.js");
const bcrypt_1 = __importDefault(require("bcrypt"));
const signup = async (req, res, next) => {
    try {
        const existingUser = await auth_service_js_1.AuthService.findUserByEmail(req.body.email);
        if (existingUser) {
            throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Validation errors', 'Email has already been assigned onto an account');
        }
        const newUser = await auth_service_js_1.AuthService.createUser(req.body);
        (0, response_utils_js_1.sendSuccess)(res, http_status_codes_1.StatusCodes.CREATED, 'User registered successfully', newUser);
    }
    catch (error) {
        next(error);
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await auth_service_js_1.AuthService.findUserByEmail(email);
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid credentials provided');
        }
        const token = auth_service_js_1.AuthService.generateToken(user);
        // Explicitly stripping password from user contextual tracking references
        const userPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at
        };
        (0, response_utils_js_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, 'Login successful', { token, user: userPayload });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
