export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function roundTo(value: number, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatProbability(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function stableSortBy<T>(items: T[], comparator: (a: T, b: T) => number) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const result = comparator(left.item, right.item);
      return result !== 0 ? result : left.index - right.index;
    })
    .map(({ item }) => item);
}

export function safeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}
