import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const rules = JSON.parse(readFileSync(resolve("scripts/waf-rules.json"), "utf8"));

for (const rule of rules) {
  if (rule.name === "Rate limit contact") continue;
  const escaped = JSON.stringify(rule).replace(/"/g, '\\"');
  const bat = resolve("scripts/_waf-one.cmd");
  writeFileSync(bat, `@echo off\r\nnpx vercel firewall rules add --json "${escaped}" --yes\r\n`);
  try {
    execSync(`"${bat}"`, { stdio: "inherit", shell: true });
  } finally {
    unlinkSync(bat);
  }
}

execSync("npx vercel firewall publish --yes", { stdio: "inherit", shell: true });
execSync("npx vercel firewall rules list", { stdio: "inherit", shell: true });
