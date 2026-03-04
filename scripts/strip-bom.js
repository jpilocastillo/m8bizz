const fs = require("fs");
const path = require("path");

const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const UTF16LE_BOM = Buffer.from([0xff, 0xfe]);
const UTF16BE_BOM = Buffer.from([0xfe, 0xff]);
const ROOT = path.join(__dirname, "..");
const FILES = [
  "lib/user-management.ts",
  "lib/auth.ts",
  "lib/data.ts",
  "app/admin/actions.ts",
];

function hasBOM(buf, bom) {
  if (buf.length < bom.length) return false;
  return bom.every((b, i) => buf[i] === b);
}

let fixed = 0;
for (const file of FILES) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) continue;
  let buf = fs.readFileSync(filePath);
  let content;
  let rewritten = false;

  if (hasBOM(buf, UTF8_BOM)) {
    content = buf.subarray(3).toString("utf8");
    rewritten = true;
  } else if (hasBOM(buf, UTF16LE_BOM)) {
    content = buf.subarray(2).toString("utf16le");
    rewritten = true;
  } else if (hasBOM(buf, UTF16BE_BOM)) {
    const slice = Buffer.from(buf.subarray(2));
    slice.swap16();
    content = slice.toString("utf16le");
    rewritten = true;
  } else if (buf.length >= 2 && buf.length % 2 === 0) {
    const looksLikeUtf16Le = [...buf].every((b, i) => i % 2 === 1 ? b === 0 : (b >= 0x20 && b < 0x7f) || b === 0x09 || b === 0x0a || b === 0x0d);
    if (looksLikeUtf16Le) {
      content = buf.toString("utf16le");
      rewritten = true;
    }
  }

  if (rewritten && content) {
    fs.writeFileSync(filePath, content, { encoding: "utf8" });
    fixed++;
  }
}
if (fixed > 0) {
  console.log("strip-bom: converted", fixed, "file(s) to UTF-8");
}
