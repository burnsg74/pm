// Seeds example GTD data so a first run has something to show. Never overwrites existing files.
//   node scripts/seed.mjs dev     -> data/dev
//   node scripts/seed.mjs prod    -> the vault data dir (VAULT_PATH / DATA_DIR)
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolveConfig } from "../backend/config.js";
import { stringifyObjects } from "../backend/csv.js";
import { PROJECT_COLUMNS, TASK_COLUMNS } from "../backend/schema.js";

const target = process.argv[2] === "prod" ? "prod" : "dev";
const config = resolveConfig({ ...process.env, NODE_ENV: target === "prod" ? "production" : "development" });
const dir = config.dir;

const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const now = new Date().toISOString();
const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();

const projects = [
  { id: "p-welcome", title: "Learn the PM app", status: "active", outcome: "I can run my whole week from the keyboard", area: "Work", notes: "Press ? for every key. Press Cmd+P to jump anywhere.", created: ago(2), updated: now },
  { id: "p-office", title: "Home office setup", status: "active", outcome: "A desk I actually want to work at", area: "Home", notes: "", created: ago(10), updated: now },
  { id: "p-passport", title: "Renew passport", status: "active", outcome: "Passport valid for 10 more years", area: "Admin", notes: "Deliberately has no next action: it shows up as stalled in the weekly review.", created: ago(20), updated: now },
  { id: "p-guitar", title: "Learn fingerstyle guitar", status: "someday", outcome: "Play one full song for friends", area: "Personal", notes: "", created: ago(40), updated: now },
];

const t = (o) => ({ project: "", context: "", due: "", start: "", starred: "", waiting_for: "", waiting_since: "", notes: "", created: ago(1), updated: now, completed: "", ...o });
const tasks = [
  t({ id: "t-in1", title: "Look into standing desk converters", status: "inbox", created: ago(0) }),
  t({ id: "t-in2", title: "Reply to Sam about Thursday", status: "inbox", created: ago(0) }),
  t({ id: "t-in3", title: "Idea: automate the weekly review notes", status: "inbox", created: ago(1) }),
  t({ id: "t-n1", title: "Press j and k to move, x to complete this task", status: "next", project: "p-welcome", context: "computer", starred: "1", due: day(0) }),
  t({ id: "t-n2", title: "Press a to capture a task: try  Buy cables @errands #home due:fri", status: "next", project: "p-welcome", context: "computer" }),
  t({ id: "t-n3", title: "Open the calendar with gc and move around with h j k l", status: "next", project: "p-welcome", context: "computer", due: day(1) }),
  t({ id: "t-n4", title: "Measure the wall for the shelf", status: "next", project: "p-office", context: "home", due: day(3) }),
  t({ id: "t-n5", title: "Order cable tray", status: "next", project: "p-office", context: "computer" }),
  t({ id: "t-n6", title: "Pick up light bulbs", status: "next", context: "errands" }),
  t({ id: "t-n7", title: "Call the dentist to book a cleaning", status: "next", context: "calls", due: day(-1) }),
  t({ id: "t-w1", title: "Chair delivery", status: "waiting", project: "p-office", waiting_for: "Office Co", waiting_since: day(-9), created: ago(9) }),
  t({ id: "t-w2", title: "Quote for the monitor arm", status: "waiting", project: "p-office", waiting_for: "Jordan", waiting_since: day(-2), created: ago(2) }),
  t({ id: "t-s1", title: "Start a dated-tickler example: this appears in 5 days", status: "next", project: "p-welcome", start: day(5), context: "computer" }),
  t({ id: "t-s2", title: "Book flights for the conference", status: "next", start: day(8), due: day(21), context: "computer" }),
  t({ id: "t-m1", title: "Build a standing desk from scratch", status: "someday", project: "p-office" }),
  t({ id: "t-m2", title: "Take a pottery class", status: "someday" }),
  t({ id: "t-d1", title: "Install the PM app", status: "done", project: "p-welcome", completed: ago(0) }),
  t({ id: "t-d2", title: "Clear the desk", status: "done", project: "p-office", completed: ago(3) }),
];

async function writeIfMissing(file, text) {
  const full = path.join(dir, file);
  if (existsSync(full)) {
    console.log(`kept   ${full}`);
    return;
  }
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, text, "utf8");
  console.log(`wrote  ${full}`);
}

await writeIfMissing("tasks.csv", stringifyObjects(TASK_COLUMNS, tasks));
await writeIfMissing("projects.csv", stringifyObjects(PROJECT_COLUMNS, projects));
await writeIfMissing(
  "reviews/README.md",
  "# Weekly reviews\n\nThe PM app writes one file per completed weekly review here (`YYYY-MM-DD.md`).\n",
);
