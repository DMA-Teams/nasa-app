// Mantiene las skills del repo.
//   node scripts/skills.mjs sync   Copia .agents/skills (Codex, canónico) a .claude/skills (Claude Code).
//   node scripts/skills.mjs lock   Recalcula los sha256 de las skills de terceros en docs/ui-skills.lock.json.
//   node scripts/skills.mjs check  Verifica hashes del lock y que .claude/skills sea copia exacta.

import { createHash } from "node:crypto";
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const canonical = join(root, ".agents/skills");
const mirror = join(root, ".claude/skills");
const lockPath = join(root, "docs/ui-skills.lock.json");
const ignored = new Set([".DS_Store", "__pycache__", "node_modules"]);

function files(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (ignored.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...files(full));
    else out.push(full);
  }
  return out;
}
const toPosix = (p) => p.split(sep).join("/");
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const skillDirs = (dir) => (existsSync(dir) ? readdirSync(dir).filter((n) => statSync(join(dir, n)).isDirectory()) : []);

function hashSkill(dir) {
  return Object.fromEntries(
    files(dir)
      .map((f) => [toPosix(relative(dir, f)), sha(f)])
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

function sync() {
  const names = skillDirs(canonical);
  for (const stale of skillDirs(mirror).filter((n) => !names.includes(n))) rmSync(join(mirror, stale), { recursive: true });
  for (const name of names) {
    rmSync(join(mirror, name), { recursive: true, force: true });
    cpSync(join(canonical, name), join(mirror, name), {
      recursive: true,
      filter: (src) => !ignored.has(src.split(sep).pop()),
    });
  }
  console.log(`Sincronizadas ${names.length} skills en .claude/skills.`);
}

function lock() {
  const data = JSON.parse(readFileSync(lockPath, "utf8"));
  for (const s of data.skills) s.sha256 = hashSkill(join(root, s.destination));
  writeFileSync(lockPath, JSON.stringify(data, null, 2) + "\n");
  console.log(`Lock actualizado (${data.skills.length} skills de terceros).`);
}

function check() {
  const problems = [];
  const data = JSON.parse(readFileSync(lockPath, "utf8"));
  const locked = new Set(data.skills.map((s) => s.name));

  for (const s of data.skills) {
    const dir = join(root, s.destination);
    if (!existsSync(dir)) {
      problems.push(`${s.name}: falta ${s.destination}`);
      continue;
    }
    const actual = hashSkill(dir);
    for (const [file, hash] of Object.entries(s.sha256)) {
      if (actual[file] !== hash) problems.push(`${s.name}/${file}: hash distinto al lock`);
    }
    for (const file of Object.keys(actual)) {
      if (!(file in s.sha256)) problems.push(`${s.name}/${file}: archivo no registrado en el lock`);
    }
  }

  for (const name of skillDirs(canonical)) {
    const skillMd = join(canonical, name, "SKILL.md");
    if (!existsSync(skillMd)) problems.push(`${name}: no tiene SKILL.md`);
    else if (!locked.has(name) && !/^---\nname: [a-z0-9-]+\ndescription: .+\n/m.test(readFileSync(skillMd, "utf8").replace(/\r\n/g, "\n")))
      problems.push(`${name}: frontmatter sin name/description`);

    const a = hashSkill(join(canonical, name));
    const b = existsSync(join(mirror, name)) ? hashSkill(join(mirror, name)) : {};
    if (JSON.stringify(a) !== JSON.stringify(b)) problems.push(`${name}: .claude/skills desincronizada (corre npm run skills:sync)`);
  }
  for (const name of skillDirs(mirror)) {
    if (!existsSync(join(canonical, name))) problems.push(`${name}: existe en .claude/skills pero no en .agents/skills`);
  }

  if (problems.length) {
    console.error(problems.map((p) => `- ${p}`).join("\n"));
    process.exit(1);
  }
  console.log(`Skills correctas: ${skillDirs(canonical).length} (${locked.size} de terceros con lock).`);
}

const commands = { sync, lock, check };
const cmd = process.argv[2];
if (!commands[cmd]) {
  console.error("Uso: node scripts/skills.mjs <sync|lock|check>");
  process.exit(1);
}
commands[cmd]();
