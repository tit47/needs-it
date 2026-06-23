import { getMetierNameToSlugMap } from "@/lib/seo/metiers";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function protectSegments(
  text: string,
  pattern: RegExp
): { protectedText: string; segments: string[] } {
  const segments: string[] = [];
  const protectedText = text.replace(pattern, (match) => {
    const token = `\x00SEG${segments.length}\x00`;
    segments.push(match);
    return token;
  });
  return { protectedText, segments };
}

function restoreSegments(text: string, segments: string[]): string {
  return text.replace(/\x00SEG(\d+)\x00/g, (_, index: string) => {
    return segments[Number(index)] ?? "";
  });
}

export function linkifyMetierNamesInMarkdown(markdown: string): string {
  const nameToSlug = getMetierNameToSlugMap();
  const names = [...nameToSlug.keys()].sort((a, b) => b.length - a.length);

  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const { protectedText, segments } = protectSegments(markdown, linkPattern);

  let linked = protectedText;
  for (const name of names) {
    const slug = nameToSlug.get(name);
    if (!slug) continue;
    const regex = new RegExp(`(?<!\\[)${escapeRegExp(name)}(?!\\])`, "gi");
    linked = linked.replace(regex, `[${name}](/${slug})`);
  }

  return restoreSegments(linked, segments);
}

export function linkifyMetierNamesInText(text: string): string {
  const nameToSlug = getMetierNameToSlugMap();
  const names = [...nameToSlug.keys()].sort((a, b) => b.length - a.length);

  let linked = text;
  for (const name of names) {
    const slug = nameToSlug.get(name);
    if (!slug) continue;
    const regex = new RegExp(escapeRegExp(name), "g");
    linked = linked.replace(
      regex,
      `<a href="/${slug}" class="legal-link">${name}</a>`
    );
  }
  return linked;
}
