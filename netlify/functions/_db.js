const { neon } = require('@neondatabase/serverless');
const conn = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
if (!conn) throw new Error('NETLIFY_DATABASE_URL is not set');
const sql = neon(conn);
const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
function json(statusCode, body) { return { statusCode, headers, body: JSON.stringify(body) }; }
function authorized(event) {
  let token = event.headers['x-admin-token'] || event.headers['X-Admin-Token'];
  if (!token) { try { token = JSON.parse(event.body || '{}').token; } catch (e) {} }
  return !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}
module.exports = { sql, headers, json, authorized };
