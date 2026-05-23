"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_js_1 = require("../../config/database.js");
class AuthService {
    static async findUserByEmail(email) {
        const result = await database_js_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }
    static async createUser(body) {
        const { name, email, password, role } = body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        const assignedRole = role || 'contributor';
        const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `;
        const result = await database_js_1.pool.query(query, [name, email, hashedPassword, assignedRole]);
        return result.rows[0];
    }
    static generateToken(user) {
        return jsonwebtoken_1.default.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, {
            // process.env থেকে আসা মানটিকে টাইপস্ক্রিপ্টের জন্য কাস্ট করে দেওয়া হলো
            expiresIn: (process.env.JWT_EXPIRES_IN || '1d')
        });
    }
}
exports.AuthService = AuthService;
