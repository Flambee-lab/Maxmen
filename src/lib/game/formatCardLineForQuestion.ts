/**
 * Texto que se muestra en la card al acertar una ronda, según el question type.
 */
export function formatCardLineForQuestion(
  questionId: string,
  chipValue: string
): string {
  const v = chipValue.trim();
  if (questionId === "relationships") {
    return `is my ${v}`;
  }
  return v;
}
