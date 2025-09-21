#!/usr/bin/env node
/* Bumpea version según el tipo de commit:
   - breaking change (! o "BREAKING CHANGE") -> major
   - feat / feact -> minor
   - fix / chore -> patch
   Otros tipos -> no bump
   Se ejecuta en commit-msg y amenda el commit para incluir package.json actualizado.
*/
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

function readMsg(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function detectBump(msg) {
  const firstLine = msg.split(/\r?\n/)[0] || "";
  const body = msg;

  // Ignorar merges/reverts automáticos o saltos explícitos
  if (/^Merge\b|^Revert\b|(\[no\s*bump\]|\[skip\s*bump\])/i.test(firstLine))
    return null;

  // BREAKING: "!" en el header o "BREAKING CHANGE:" en el body
  if (/[a-z]+(?:\(.+?\))?!:/.test(firstLine) || /BREAKING CHANGE:/i.test(body))
    return "major";

  // Tipo por header convencional
  const m = firstLine.match(/^(\w+)(?:\(.+?\))?:/);
  const type = m?.[1]?.toLowerCase();

  if (type === "feat" || type === "feact") return "minor";
  if (type === "fix" || type === "chore") return "patch";

  return null; // no bump para docs, refactor, test, etc.
}

function fileExists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function stageLockIfExists() {
  const lockCandidates = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"];
  for (const f of lockCandidates) {
    if (fileExists(path.join(process.cwd(), f))) {
      try {
        execSync(`git add ${f}`, { stdio: "ignore" });
      } catch {}
    }
  }
}

(function main() {
  const msgFile = process.argv[2];
  const msg = readMsg(msgFile);
  const bump = detectBump(msg);

  if (!bump) {
    console.log("[husky:bump] No bump (tipo de commit no requiere versión).");
    return;
  }

  // Usa npm version por su flag --no-git-tag-version (seguro incluso si usas Yarn)
  try {
    console.log(`[husky:bump] Aplicando bump: ${bump}`);
    execSync(`npm version ${bump} --no-git-tag-version`, { stdio: "inherit" });

    // Stage de package.json y lock correspondiente
    execSync("git add package.json", { stdio: "inherit" });
    stageLockIfExists();

    // Amendar sin re-ejecutar hooks
    execSync("HUSKY=0 git commit --amend --no-edit --no-verify", {
      stdio: "inherit",
    });
    console.log("[husky:bump] Versión actualizada y commit enmendado.");
  } catch (err) {
    console.error("[husky:bump] Error durante el bump:", err?.message || err);
    // No abortamos el commit original si falla el bump
  }
})();
