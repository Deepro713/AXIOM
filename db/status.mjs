// Print the live implementation status from the AXIOM tracking DB.
// Usage: node status.mjs            (all phases + features)
//        node status.mjs <phase>    (one phase, e.g. alpha)
import { makeClient } from "./db.mjs";

const phaseArg = process.argv[2];
const client = makeClient();

const bar = (p) => {
  const n = Math.round((p / 100) * 20);
  return "█".repeat(n) + "░".repeat(20 - n);
};

try {
  await client.connect();

  console.log("\n  AXIOM Command — implementation status\n  " + "─".repeat(60));
  const { rows: phases } = await client.query("select * from phase_progress");
  for (const p of phases) {
    console.log(
      `\n  ${p.name.padEnd(11)} ${String(p.target_window).padEnd(9)} ` +
        `${bar(p.avg_progress)} ${String(p.avg_progress).padStart(3)}%  ` +
        `[${p.done} done · ${p.in_progress} wip · ${p.blocked} blocked · ${p.planned} planned]`
    );
  }

  const { rows: feats } = await client.query(
    `select code, phase_key, title, priority, status, progress
       from features
       ${phaseArg ? "where phase_key = $1" : ""}
       order by sort_order`,
    phaseArg ? [phaseArg] : []
  );
  console.log("\n  " + "─".repeat(60));
  const icon = { planned: "○", in_progress: "◐", blocked: "✗", in_review: "◓", done: "●" };
  for (const f of feats) {
    console.log(
      `  ${icon[f.status] || "○"} ${f.code.padEnd(7)} ${f.priority}  ` +
        `${String(f.progress).padStart(3)}%  ${f.title}`
    );
  }
  console.log("");
} catch (e) {
  console.error("✗ status failed:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
