const formatter = new Intl.NumberFormat("da-DK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function money(value: number | string): string {
  return `${formatter.format(Number(value) || 0)} kr.`;
}
