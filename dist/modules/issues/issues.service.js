"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuesService = void 0;
const database_js_1 = require("../../config/database.js");
class IssuesService {
    static async create(body, reporterId) {
        const { title, description, type } = body;
        const query = `
      INSERT INTO issues (title, description, type, status, reporter_id)
      VALUES ($1, $2, $3, 'open', $4)
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `;
        const result = await database_js_1.pool.query(query, [title, description, type, reporterId]);
        return result.rows[0];
    }
    static async findAll(filters) {
        let queryStr = 'SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues';
        const conditions = [];
        const values = [];
        if (filters.type) {
            values.push(filters.type);
            conditions.push(`type = $${values.length}`);
        }
        if (filters.status) {
            values.push(filters.status);
            conditions.push(`status = $${values.length}`);
        }
        if (conditions.length > 0) {
            queryStr += ' WHERE ' + conditions.join(' AND ');
        }
        const order = filters.sort === 'oldest' ? 'ASC' : 'DESC';
        queryStr += ` ORDER BY created_at ${order}`;
        const result = await database_js_1.pool.query(queryStr, values);
        return result.rows;
    }
    static async findById(id) {
        const result = await database_js_1.pool.query('SELECT * FROM issues WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async fetchUsersInBatches(userIds) {
        if (userIds.length === 0)
            return [];
        const queriesPlaceholder = userIds.map((_, i) => `$${i + 1}`).join(', ');
        const queryStr = `SELECT id, name, role FROM users WHERE id IN (${queriesPlaceholder})`;
        const result = await database_js_1.pool.query(queryStr, userIds);
        return result.rows;
    }
    static async update(id, fields) {
        const trackingPairs = [];
        const queryValues = [];
        Object.keys(fields).forEach((key) => {
            queryValues.push(fields[key]);
            trackingPairs.push(`${key} = $${queryValues.length}`);
        });
        queryValues.push(id);
        const queryStr = `
      UPDATE issues 
      SET ${trackingPairs.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${queryValues.length} 
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `;
        const result = await database_js_1.pool.query(queryStr, queryValues);
        return result.rows[0];
    }
    static async delete(id) {
        await database_js_1.pool.query('DELETE FROM issues WHERE id = $1', [id]);
    }
}
exports.IssuesService = IssuesService;
