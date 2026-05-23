"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_js_1 = require("./config/database.js");
const auth_router_js_1 = require("./modules/auth/auth.router.js");
const issues_router_js_1 = require("./modules/issues/issues.router.js");
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const http_status_codes_1 = require("http-status-codes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Base Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Application Routing Modules
app.use('/api/auth', auth_router_js_1.authRouter);
app.use('/api/issues', issues_router_js_1.issuesRouter);
// Undefined Routes fallback catch
app.use((req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Requested route endpoint destination does not exist'
    });
});
// Global centralized Error Manager tracking pipeline handles sync & async catches
app.use(error_middleware_js_1.errorHandler);
// Bootstrapping operations sequence
const bootstrap = async () => {
    await (0, database_js_1.initDb)();
    app.listen(PORT, () => {
        console.log(`🚀 DevPulse server fully alive and spinning on port ${PORT}`);
    });
};
bootstrap();
