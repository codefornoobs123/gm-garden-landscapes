// Fails if any key in content.json is not declared in src/admin/config.yml.
// (Decap CMS silently deletes undeclared keys when Gary presses Publish.)
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const root = path.join(__dirname, "..");
const content = JSON.parse(fs.readFileSync(path.join(root, "content.json"), "utf8"));
const config = yaml.load(fs.readFileSync(path.join(root, "src/admin/config.yml"), "utf8"));

const file = config.collections.flatMap((c) => c.files || []).find((f) => f.file === "content.json");
if (!file) { console.error("✗ config.yml has no file entry for content.json"); process.exit(1); }

const problems = [];
function walk(value, fields, where) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, fields, `${where}[${i}]`));
    return;
  }
  if (value && typeof value === "object") {
    const byName = Object.fromEntries((fields || []).map((f) => [f.name, f]));
    for (const key of Object.keys(value)) {
      const f = byName[key];
      if (!f) { problems.push(`${where}.${key} is in content.json but not in config.yml`); continue; }
      const sub = f.fields || (f.field ? [f.field] : null);
      if (f.widget === "list" && f.field && !f.fields) {
        // list of single values: [{image: ...}] handled via field name
        (value[key] || []).forEach((item, i) => {
          if (item && typeof item === "object") walk(item, [f.field], `${where}.${key}[${i}]`);
        });
      } else if (sub) walk(value[key], sub, `${where}.${key}`);
    }
  }
}
walk(content, file.fields, "content");

if (problems.length) {
  console.error("✗ Undeclared keys (Decap would delete these):\n  " + problems.join("\n  "));
  process.exit(1);
}
console.log("✓ Every key in content.json is declared in config.yml");
