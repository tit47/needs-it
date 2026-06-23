export interface FaqItem {
  question: string;
  answer: string;
}

export function extractFaqItemsFromMarkdown(markdown: string): FaqItem[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const items: FaqItem[] = [];
  let currentQuestion: string | null = null;
  let currentAnswer: string[] = [];

  const flush = () => {
    if (currentQuestion && currentAnswer.length > 0) {
      items.push({
        question: currentQuestion,
        answer: currentAnswer.join(" ").trim(),
      });
    }
    currentQuestion = null;
    currentAnswer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const headingMatch = trimmed.match(/^##\s+(.+)$/);

    if (headingMatch) {
      flush();
      currentQuestion = headingMatch[1].trim();
      continue;
    }

    if (!currentQuestion || !trimmed || trimmed.startsWith("#")) {
      continue;
    }

    currentAnswer.push(trimmed);
  }

  flush();
  return items;
}
