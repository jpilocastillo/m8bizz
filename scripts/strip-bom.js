const fs = require("fs");
const path = require("path");

const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const ROOT = path.join(__dirname, "..");
const FILES = ["lib/user-management.ts"];

// First line must be exactly this (ASCII only) so TS parser never sees BOM or smart quotes
const SAFE_FIRST_LINE = '"use server"';

let fixed = 0;
for (const file of FILES) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) continue;
  let buf = fs.readFileSync(filePath);
  if (buf.length >= 3 && buf[0] === UTF8_BOM[0] && buf[1] === UTF8_BOM[1] && buf[2] === UTF8_BOM[2]) {
    buf = buf.subarray(3);
  }
  let content = buf.toString("utf8");
  const firstNewline = content.indexOf("\n");
  const rest = firstNewline >= 0 ? content.slice(firstNewline + 1) : "";
  const newContent = SAFE_FIRST_LINE + "\n" + rest;
  fs.writeFileSync(filePath, newContent, { encoding: "utf8" });
  fixed++;
}
if (fixed > 0) {
  console.log("strip-bom: normalized", fixed, "file(s)");
}
