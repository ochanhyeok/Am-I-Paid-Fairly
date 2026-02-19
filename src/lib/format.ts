// 통화 포맷: "$140,000" 또는 "₩55,000,000"
export function formatCurrency(
  amount: number,
  currencySymbol: string = "$"
): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString("en-US");
  return `${currencySymbol}${formatted}`;
}

// 상위% 포맷: "Top 32%" 또는 "Bottom 12%"
export function formatPercentile(value: number): string {
  if (value >= 50) {
    const top = 100 - Math.round(value);
    return `Top ${Math.max(top, 1)}%`;
  }
  const bottom = Math.round(value);
  return `Bottom ${Math.max(bottom, 1)}%`;
}

// 숫자 포맷: "8,181"
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

// 연간 → 월간 변환
export function toMonthly(annual: number): number {
  return Math.round(annual / 12);
}

// 연간 → 시급 변환 (40시간/주 × 52주 = 2,080시간)
export function toHourly(annual: number): number {
  return Math.round((annual / 2080) * 100) / 100;
}

// 시급 포맷: "$52.88"
export function formatHourly(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// USD 포맷 (축약): "$42.3K" 또는 "$1.2M"
export function formatUSDShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${Math.round(amount)}`;
}
