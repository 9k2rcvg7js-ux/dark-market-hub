import { NextResponse } from 'next/server';
import { worldIssueSections } from '@/lib/mock';

export const dynamic = 'force-dynamic';

async function fetchNews(query: string) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];

  const url = new URL('https://openapi.naver.com/v1/search/news.json');
  url.searchParams.set('query', query);
  url.searchParams.set('display', '4');
  url.searchParams.set('sort', 'date');
  const res = await fetch(url, {
    headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret },
    cache: 'no-store'
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function GET() {
  const sections = await Promise.all(
    worldIssueSections.map(async (section) => ({ ...section, news: await fetchNews(section.query) }))
  );
  return NextResponse.json({ sections });
}
