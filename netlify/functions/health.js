const { sql, json } = require('./_db');

// Visit /api/health to check the database connection and confirm the
// responses/reactions tables exist. Useful when responses aren't saving.
exports.handler = async () => {
  try {
    const [{ now }] = await sql`select now() as now`;
    const [{ responses_table, reactions_table }] = await sql`
      select to_regclass('public.responses') as responses_table,
             to_regclass('public.reactions') as reactions_table`;
    const ok = !!responses_table && !!reactions_table;
    return json(ok ? 200 : 500, {
      ok,
      connected: true,
      time: now,
      responses_table: !!responses_table,
      reactions_table: !!reactions_table,
      hint: ok ? undefined : 'Tables are missing on THIS branch of the database. Run schema.sql against the same branch this site actually uses in production (Data & storage → Database → production branch → SQL console), not a preview/agent branch.'
    });
  } catch (e) {
    return json(500, { ok: false, connected: false, error: e.message });
  }
};
