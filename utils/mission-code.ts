const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 4;

export function generateMissionCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function normalizeMissionCodeInput(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
}

export function isValidMissionCodeFormat(value: string): boolean {
  if (value.length !== 4) return false;
  return [...value].every((char) => CODE_CHARS.includes(char));
}

export function missionCodesMatch(
  input: string,
  expected: string
): boolean {
  return normalizeMissionCodeInput(input) === normalizeMissionCodeInput(expected);
}
