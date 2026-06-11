import { readFileSync } from "fs";
import { join } from "path";
import {
  LEGAL_DOCUMENTS,
  type LegalDocument,
  type LegalDocumentSlug,
} from "@/lib/legal-documents";

export function getLegalDocument(slug: LegalDocumentSlug): LegalDocument {
  const meta = LEGAL_DOCUMENTS[slug];
  const filePath = join(process.cwd(), meta.filename);
  const content = readFileSync(filePath, "utf-8");

  return {
    ...meta,
    content,
  };
}
