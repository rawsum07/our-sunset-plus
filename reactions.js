const { sql, headers, json } = require('./_db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {});
  if (event.httpMethod !== 'POST') return json(405, { error: 'method not allowed' });
  try {
    const { responseId, userId, type } = JSON.parse(event.body || '{}');
    if (!responseId || !userId || !type) return json(400, { error: 'missing fields' });
    await sql`
      insert into reactions (response_id, user_id, type) values (${responseId}, ${userId}, ${type})
      on conflict (response_id, user_id) do update set type = excluded.type`;
    return json(200, { ok: true });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
