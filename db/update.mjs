// Update a feature's status/progress/notes (and optionally roll the phase status).
// Usage:
//   node update.mjs <CODE> <status> [progress] ["note"]
//   node update.mjs AX-101 in_progress 40 "BLE pairing handshake working"
//   node update.mjs AX-101 done 100
//   node update.mjs phase alpha in_progress           (set a phase status directly)
//
// feature status: planned | in_progress | blocked | in_review | done
// phase status:   not_started | in_progress | done
import { makeClient } from "./db.mjs";

const args = process.argv.slice(2);
const client = makeClient();

const FEATURE_STATES = ["planned", "in_progress", "blocked", "in_review", "done"];
const PHASE_STATES = ["not_started", "in_progress", "done"];

try {
  await client.connect();

  if (args[0] === "phase") {
    const [, key, status] = args;
    if (!PHASE_STATES.includes(status))
      throw new Error(`phase status must be one of: ${PHASE_STATES.join(", ")}`);
    const r = await client.query(
      "update phases set status=$2 where phase_key=$1 returning name, status",
      [key, status]
    );
    if (!r.rowCount) throw new Error(`no phase '${key}'`);
    console.log(`✓ phase ${r.rows[0].name} → ${r.rows[0].status}`);
  } else {
    const [code, status, progressRaw, note] = args;
    if (!code || !status)
      throw new Error('usage: node update.mjs <CODE> <status> [progress] ["note"]');
    if (!FEATURE_STATES.includes(status))
      throw new Error(`status must be one of: ${FEATURE_STATES.join(", ")}`);
    let progress = progressRaw != null ? parseInt(progressRaw, 10) : null;
    if (progress == null) progress = status === "done" ? 100 : status === "planned" ? 0 : null;

    const r = await client.query(
      `update features
          set status = $2,
              progress = coalesce($3, progress),
              notes = coalesce($4, notes)
        where code = $1
        returning code, title, status, progress`,
      [code, status, progress, note ?? null]
    );
    if (!r.rowCount) throw new Error(`no feature '${code}'`);
    const f = r.rows[0];
    console.log(`✓ ${f.code} "${f.title}" → ${f.status} (${f.progress}%)`);

    // auto-roll the parent phase status from its features
    await client.query(
      `update phases p set status = sub.s
         from (
           select phase_key,
             case
               when count(*) filter (where status='done') = count(*) then 'done'
               when count(*) filter (where status in ('in_progress','in_review','blocked','done')) > 0 then 'in_progress'
               else 'not_started'
             end as s
           from features group by phase_key
         ) sub
        where p.phase_key = sub.phase_key`
    );
  }
} catch (e) {
  console.error("✗ update failed:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
