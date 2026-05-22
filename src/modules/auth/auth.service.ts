import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/database.js';

export class AuthService {
  static async findUserByEmail(email: string) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async createUser(body: any) {
    const { name, email, password, role } = body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const assignedRole = role || 'contributor';

    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `;
    const result = await pool.query(query, [name, email, hashedPassword, assignedRole]);
    return result.rows[0];
  }

  static generateToken(user: any): string {
    return jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET as string,
      { 
        // process.env থেকে আসা মানটিকে টাইপস্ক্রিপ্টের জন্য কাস্ট করে দেওয়া হলো
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any 
      }
    );
  }
}