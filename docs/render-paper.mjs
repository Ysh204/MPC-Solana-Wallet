import fs from "node:fs";
import path from "node:path";

const docsDir = path.resolve("docs");
const inputPath = path.join(docsDir, "TipJar_Research_Paper_IEEE.md");
const outputPath = path.join(docsDir, "TipJar_Research_Paper_IEEE.html");

const markdown = fs.readFileSync(inputPath, "utf8").replace(/\r\n/g, "\n");

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineFormat(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function parseBlocks(lines) {
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#{1,6}\s+/, "");
      blocks.push({ type: "heading", level, text });
      i += 1;
      continue;
    }

    if (/^- /.test(line)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^- /, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const para = [];
    while (i < lines.length) {
      const current = lines[i];
      const trimmed = current.trim();
      if (!trimmed) break;
      if (/^#{1,6}\s+/.test(trimmed)) break;
      if (/^- /.test(trimmed)) break;
      if (/^\d+\.\s+/.test(trimmed)) break;
      para.push(current);
      i += 1;
    }

    const paragraph = para
      .join("\n")
      .split(/ {2,}\n|\n/)
      .map((part) => part.trim())
      .filter(Boolean)
      .join("<br>");

    blocks.push({ type: "p", text: paragraph });
  }

  return blocks;
}

const blocks = parseBlocks(markdown.split("\n"));

const title = blocks.find((block) => block.type === "heading" && block.level === 1)?.text ?? "Research Paper";
const firstH2Index = blocks.findIndex((block) => block.type === "heading" && block.level === 2);
const frontMatter = firstH2Index === -1 ? blocks.slice(1) : blocks.slice(1, firstH2Index);
const main = firstH2Index === -1 ? [] : blocks.slice(firstH2Index);

const authors = [];
let currentAuthor = [];
for (const block of frontMatter) {
  if (block.type !== "p") continue;
  const plain = block.text.replace(/<br>/g, "\n");
  if (/<strong>/.test(block.text) && currentAuthor.length) {
    authors.push(currentAuthor);
    currentAuthor = [];
  }
  currentAuthor.push(plain);
}
if (currentAuthor.length) authors.push(currentAuthor);

const abstractIndex = main.findIndex((block) => block.type === "heading" && block.level === 2 && block.text === "Abstract");
const indexTermsIndex = main.findIndex((block) => block.type === "heading" && block.level === 2 && block.text === "Index Terms");
const bodyStartIndex = main.findIndex((block, idx) => idx > indexTermsIndex && block.type === "heading" && block.level === 2);

const abstractBlocks =
  abstractIndex !== -1 && indexTermsIndex !== -1 ? main.slice(abstractIndex + 1, indexTermsIndex) : [];
const indexTermBlocks =
  indexTermsIndex !== -1 && bodyStartIndex !== -1 ? main.slice(indexTermsIndex + 1, bodyStartIndex) : [];
const bodyBlocks = bodyStartIndex !== -1 ? main.slice(bodyStartIndex) : [];

function renderBlock(block) {
  if (block.type === "heading") {
    if (block.level === 2) return `<h2>${inlineFormat(block.text)}</h2>`;
    if (block.level === 3) return `<h3>${inlineFormat(block.text)}</h3>`;
    return `<h4>${inlineFormat(block.text)}</h4>`;
  }
  if (block.type === "p") {
    const paragraph = block.text
      .split("<br>")
      .map((part) => inlineFormat(part))
      .join("<br>");
    return `<p>${paragraph}</p>`;
  }
  if (block.type === "ul") return `<ul>${block.items.map((item) => `<li>${inlineFormat(item)}</li>`).join("")}</ul>`;
  if (block.type === "ol") return `<ol>${block.items.map((item) => `<li>${inlineFormat(item)}</li>`).join("")}</ol>`;
  return "";
}

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 18mm 14mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #ffffff;
      color: #111111;
      font-family: "Times New Roman", Times, serif;
      line-height: 1.28;
      font-size: 11pt;
    }

    .paper {
      max-width: 210mm;
      margin: 0 auto;
      padding: 6mm 0 10mm;
    }

    h1 {
      margin: 0 0 8mm;
      font-size: 20pt;
      line-height: 1.2;
      text-align: center;
      font-weight: 700;
    }

    .authors {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6mm 8mm;
      margin-bottom: 8mm;
    }

    .author {
      text-align: center;
      font-size: 10pt;
    }

    .author strong {
      display: block;
      margin-bottom: 1mm;
      font-size: 11pt;
    }

    .full-width {
      margin-bottom: 4mm;
    }

    .label {
      font-weight: 700;
      font-style: italic;
      display: inline;
    }

    .full-width p {
      display: inline;
      margin: 0;
      text-align: justify;
    }

    .columns {
      column-count: 2;
      column-gap: 7mm;
      column-fill: auto;
    }

    .columns > * {
      break-inside: avoid;
    }

    h2 {
      margin: 0 0 2mm;
      font-size: 10.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    h3 {
      margin: 0 0 1.5mm;
      font-size: 10pt;
      font-weight: 700;
    }

    h4 {
      margin: 0 0 1.5mm;
      font-size: 10pt;
      font-weight: 700;
    }

    p {
      margin: 0 0 3mm;
      text-align: justify;
    }

    ul, ol {
      margin: 0 0 3mm 4mm;
      padding-left: 4mm;
    }

    li {
      margin: 0 0 1.2mm;
      text-align: justify;
    }

    code {
      font-family: "Courier New", monospace;
      font-size: 9.5pt;
    }

    .references h2 {
      break-after: avoid;
    }
  </style>
</head>
<body>
  <main class="paper">
    <h1>${inlineFormat(title)}</h1>
    <section class="authors">
      ${authors
        .map((parts) => `<div class="author">${parts.map((part) => `<div>${inlineFormat(part)}</div>`).join("")}</div>`)
        .join("")}
    </section>

    <section class="full-width">
      <span class="label">Abstract:</span>
      ${abstractBlocks.map(renderBlock).join("")}
    </section>

    <section class="full-width">
      <span class="label">Index Terms:</span>
      ${indexTermBlocks.map(renderBlock).join("")}
    </section>

    <section class="columns references">
      ${bodyBlocks.map(renderBlock).join("")}
    </section>
  </main>
</body>
</html>
`;

fs.writeFileSync(outputPath, html, "utf8");
console.log(`Wrote ${outputPath}`);
