const fs = require("fs");
const path = require("path");

const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const ROOT = path.join(__dirname, "..");
const FILES = ["lib/user-management.ts"];

let stripped = 0;
for (const file of FILES) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) continue;
  const buf = fs.readFileSync(filePath);
  if (buf.length >= 3 && buf[0] === UTF8_BOM[0] && buf[1] === UTF8_BOM[1] && buf[2] === UTF8_BOM[2]) {
    fs.writeFileSync(filePath, buf.subarray(3), { encoding: "utf8" });
    stripped++;
  }
}
if (stripped > 0) {
  console.log("strip-bom: removed BOM from", stripped, "file(s)");
}
