const INTERNAL_LINKS: Record<string, string> = {
  "./POLITIQUE_DE_CONFIDENTIALITE.md": "/politique-de-confidentialite",
  "./CGU.md": "/cgu",
  "./MENTIONS_LEGALES.md": "/mentions-legales",
  "POLITIQUE_DE_CONFIDENTIALITE.md": "/politique-de-confidentialite",
  "CGU.md": "/cgu",
  "MENTIONS_LEGALES.md": "/mentions-legales",
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveLink(href: string): string {
  const trimmed = href.trim();
  return INTERNAL_LINKS[trimmed] ?? trimmed;
}

function processInline(text: string): string {
  const links: string[] = [];
  const codes: string[] = [];

  let working = text.replace(/`([^`]+)`/g, (_, code: string) => {
    const index = codes.length;
    codes.push(`<code>${escapeHtml(code)}</code>`);
    return `\x00CODE${index}\x00`;
  });

  working = working.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label: string, href: string) => {
      const index = links.length;
      const url = resolveLink(href);
      const isExternal = /^https?:\/\//i.test(url);
      const attrs = isExternal
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      links.push(
        `<a href="${escapeHtml(url)}" class="legal-link"${attrs}>${escapeHtml(label)}</a>`
      );
      return `\x00LINK${index}\x00`;
    }
  );

  working = escapeHtml(working);

  working = working.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  working = working.replace(/\x00LINK(\d+)\x00/g, (_, index: string) => {
    return links[Number(index)] ?? "";
  });

  working = working.replace(/\x00CODE(\d+)\x00/g, (_, index: string) => {
    return codes[Number(index)] ?? "";
  });

  return working;
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith("|");
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s|:-]+\|$/.test(line.trim());
}

function parseTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(lines: string[]): string {
  const headerCells = parseTableCells(lines[0]);
  const bodyLines = lines.slice(2);

  const thead = `<thead><tr>${headerCells
    .map((cell) => `<th>${processInline(cell)}</th>`)
    .join("")}</tr></thead>`;

  const tbody = `<tbody>${bodyLines
    .map(
      (line) =>
        `<tr>${parseTableCells(line)
          .map((cell) => `<td>${processInline(cell)}</td>`)
          .join("")}</tr>`
    )
    .join("")}</tbody>`;

  return `<div class="legal-table-wrap"><table>${thead}${tbody}</table></div>`;
}

function renderList(items: string[], ordered: boolean): string {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items
    .map((item) => `<li>${processInline(item)}</li>`)
    .join("")}</${tag}>`;
}

export function renderMarkdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];

  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index++;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push("<hr />");
      index++;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push(
        `<h${level}>${processInline(headingMatch[2])}</h${level}>`
      );
      index++;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quoteLines.push(lines[index].trim().slice(2));
        index++;
      }
      blocks.push(
        `<blockquote>${quoteLines
          .map((quoteLine) => `<p>${processInline(quoteLine)}</p>`)
          .join("")}</blockquote>`
      );
      continue;
    }

    if (isTableRow(trimmed)) {
      const tableLines: string[] = [];
      while (index < lines.length && isTableRow(lines[index].trim())) {
        tableLines.push(lines[index].trim());
        index++;
      }
      if (tableLines.length >= 2 && isTableSeparator(tableLines[1])) {
        blocks.push(renderTable(tableLines));
      }
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index++;
      }
      blocks.push(renderList(items, false));
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,3}\s+/.test(lines[index].trim()) &&
      !/^---+$/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith("> ") &&
      !isTableRow(lines[index].trim()) &&
      !/^[-*]\s+/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index++;
    }

    blocks.push(`<p>${processInline(paragraphLines.join(" "))}</p>`);
  }

  return blocks.join("\n");
}
