#!/usr/bin/env node
/* Bump de versión según mensaje de commit.
   - feat / feact  -> minor
   - fix / chore   -> patch
   - feat! ó BREAKING CHANGE -> major
   Si no coincide, no bump.
*/
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

// Directorio del package a versionar = carpeta padre de este script (frontend/)
const PKG_DIR = path.resolve(__dirname, "..");

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

  // Ignora merges, reverts o marcas para saltar el bump
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

  return null;
}

function stageLocks() {
  for (const f of ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"]) {
    const p = path.join(PKG_DIR, f);
    try {
      fs.accessSync(p);
      execSync(`git add "${p}"`, { stdio: "ignore" });
    } catch {}
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

  try {
    console.log(
      `[husky:bump] Aplicando bump (${bump}) en ${path.join(
        PKG_DIR,
        "package.json"
      )}`
    );
    execSync(`npm version ${bump} --no-git-tag-version`, {
      stdio: "inherit",
      cwd: PKG_DIR,
    });

    execSync(`git add "${path.join(PKG_DIR, "package.json")}"`, {
      stdio: "inherit",
    });
    stageLocks();

    // Amenda el commit sin re-ejecutar hooks
    execSync("HUSKY=0 git commit --amend --no-edit --no-verify", {
      stdio: "inherit",
    });
    console.log("[husky:bump] Versión actualizada y commit enmendado.");
  } catch (err) {
    console.error("[husky:bump] Error durante el bump:", err?.message || err);
  }
})();
