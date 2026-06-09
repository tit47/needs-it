export function normalizePhone(phone: string): string {
  return phone.replace(/[\s.\-()]/g, "");
}

export function isValidFrenchPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^(?:(?:\+|00)33|0)[1-9]\d{8}$/.test(normalized);
}

export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.startsWith("+33")) {
    return normalized.replace(
      /^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/,
      "+33 $1 $2 $3 $4 $5"
    );
  }
  if (normalized.length === 10) {
    return normalized.replace(
      /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
      "$1 $2 $3 $4 $5"
    );
  }
  return phone;
}
