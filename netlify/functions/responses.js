const { sql, headers, json } = require('./_db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {});
  try {
    if (event.httpMethod === 'GET') {
      const q = event.queryStringParameters || {};
      const day = q.day;
      if (!day) return json(400, { error: 'day is required' });
      const rows = await sql`
        select id, answer, display_name as name, visual_type as vt
        from responses where day = ${day} and hidden = false
        order by created_at asc limit 300`;
      let mine = null;
      if (q.userId) {
        const m = await sql`
          select answer, display_name as name, visual_type as vt
          from responses where day = ${day} and user_id = ${q.userId} limit 1`;
        mine = m[0] || null;
      }
      return json(200, { rows, mine });
    }

    if (event.httpMethod === 'POST') {
      const b = JSON.parse(event.body || '{}');
      const { day, userId, answer, displayName, anonymous, visualType } = b;
      if (!day || !userId || !answer || !String(answer).trim()) return json(400, { error: 'missing fields' });
      const inserted = await sql`
        insert into responses (day, user_id, answer, display_name, anonymous, visual_type)
        values (${day}, ${userId}, ${String(answer).trim().slice(0, 160)},
                ${(displayName || 'anonymous').slice(0, 24)}, ${!!anonymous}, ${(visualType | 0) % 6})
        on conflict (day, user_id) do nothing
        returning id, answer, display_name as name, visual_type as vt`;
      if (inserted.length) return json(200, inserted[0]);
      const existing = await sql`
        select id, answer, display_name as name, visual_type as vt
        from responses where day = ${day} and user_id = ${userId} limit 1`;
      return json(200, { ...(existing[0] || {}), already: true });
    }

    return json(405, { error: 'method not allowed' });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
