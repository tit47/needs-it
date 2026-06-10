const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateFr(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatTimeFr(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

export function formatDateTimeFr(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

export function startOfTodayIso(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}
