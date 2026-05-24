/**
 * One-line fix for Payload + Next 16 + tsx: default import from @next/env is undefined.
 * Safe to run repeatedly (no-op if already patched).
 */
const fs = require("node:fs");
const path = require("node:path");

const file = path.join(__dirname, "..", "node_modules", "payload", "dist", "bin", "loadEnv.js");
let src = fs.readFileSync(file, "utf8");

const needle = "import * as nextEnvImport from '@next/env'";
if (src.includes(needle)) {
  process.exit(0);
}

const from =
  "import nextEnvImport from '@next/env';\nimport { findUpSync } from '../utilities/findUp.js';\nconst { loadEnvConfig } = nextEnvImport;";
const to =
  "import * as nextEnvImport from '@next/env';\nimport { findUpSync } from '../utilities/findUp.js';\nconst { loadEnvConfig } = nextEnvImport;";

if (!src.includes(from)) {
  console.error("patch-payload-loadenv: unexpected loadEnv.js format; skip or update patch.");
  process.exit(1);
}

fs.writeFileSync(file, src.replace(from, to));
