const { sql, headers, json, authorized } = require('./_db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {});
  if (!authorized(event)) return json(401, { error: 'unauthorized' });
  try {
    if (event.httpMethod === 'GET') {
      const rows = await sql`
        select id, day, answer, display_name, hidden, created_at
        from responses order by day desc, created_at desc limit 500`;
      return json(200, rows);
    }
    const b = JSON.parse(event.body || '{}');
    if (b.action === 'hide') {
      await sql`update responses set hidden = ${!!b.hidden} where id = ${b.id}`;
      return json(200, { ok: true });
    }
    if (b.action === 'delete') {
      await sql`delete from responses where id = ${b.id}`;
      return json(200, { ok: true });
    }
    return json(400, { error: 'unknown action' });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
