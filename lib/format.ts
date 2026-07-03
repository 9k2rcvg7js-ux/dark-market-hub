export function formatNumber(value: number | string | null | undefined) {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '-';
  return num.toLocaleString('ko-KR');
}

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .trim();
}

export function todayKorea() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}
