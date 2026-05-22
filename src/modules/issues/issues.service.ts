import { pool } from '../../config/database.js';

export class IssuesService {
  static async create(body: any, reporterId: number) {
    const { title, description, type } = body;
    const query = `
      INSERT INTO issues (title, description, type, status, reporter_id)
      VALUES ($1, $2, $3, 'open', $4)
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `;
    const result = await pool.query(query, [title, description, type, reporterId]);
    return result.rows[0];
  }

  static async findAll(filters: { type?: string; status?: string; sort?: string }) {
    let queryStr = 'SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues';
    const conditions: string[] = [];
    const values: any[] = [];

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

    const result = await pool.query(queryStr, values);
    return result.rows;
  }

  static async findById(id: number) {
    const result = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async fetchUsersInBatches(userIds: number[]) {
    if (userIds.length === 0) return [];
    const queriesPlaceholder = userIds.map((_, i) => `$${i + 1}`).join(', ');
    const queryStr = `SELECT id, name, role FROM users WHERE id IN (${queriesPlaceholder})`;
    const result = await pool.query(queryStr, userIds);
    return result.rows;
  }

  static async update(id: number, fields: any) {
    const trackingPairs: string[] = [];
    const queryValues: any[] = [];
    
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
    const result = await pool.query(queryStr, queryValues);
    return result.rows[0];
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM issues WHERE id = $1', [id]);
  }
}