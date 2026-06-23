import fs from "node:fs";
import path from "node:path";

export type SeoContentDocument = {
  slug: string;
  title: string;
  content: string;
};

function readContentFile(filename: string): string {
  const filePath = path.join(process.cwd(), "content", filename);
  return fs.readFileSync(filePath, "utf-8");
}

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? "Need's it";
}

export function getSeoContentDocument(filename: string): SeoContentDocument {
  const content = readContentFile(filename);
  const title = extractTitle(content);

  return {
    slug: filename.replace(/\.md$/, ""),
    title,
    content,
  };
}
