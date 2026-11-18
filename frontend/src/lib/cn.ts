export const cn = (...c: (string | false | null | undefined)[]): string =>
  c.filter(Boolean).join(' ');