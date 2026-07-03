import { NextRequest, NextResponse } from 'next/server';
import { stripHtml } from '@/lib/format';

export const dynamic = 'force-dynamic';

function mockNews(query: string) {
  return [
    {
      title: `${query} 관련 주요 뉴스`,
      link: 'https://news.naver.com/',
      originallink: 'https://news.naver.com/',
      pubDate: new Date().toUTCString(),
      summary: `${query}와 관련된 최신 흐름을 확인할 수 있는 뉴스 영역입니다. NAVER_CLIENT_ID/SECRET을 넣으면 실제 뉴스가 표시됩니다.`
    },
    {
      title: `${query} 시장 반응 정리`,
      link: 'https://finance.naver.com/',
      originallink: 'https://finance.naver.com/',
      pubDate: new Date().toUTCString(),
      summary: '거래량 증가, 수급 변화, 업종 이슈를 함께 확인하도록 구성했습니다.'
    }
  ];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '한국 주식시장';
  const display = Math.min(Number(searchParams.get('display') || 5), 20);
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ source: 'mock', query, items: mockNews(query) });
  }

  try {
    const url = new URL('https://openapi.naver.com/v1/search/news.json');
    url.searchParams.set('query', query);
    url.searchParams.set('display', String(display));
    url.searchParams.set('start', '1');
    url.searchParams.set('sort', 'date');

    const res = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`Naver news error: ${res.status}`);
    const data = await res.json();
    const items = (data.items || []).map((item: Record<string, string>) => ({
      title: stripHtml(item.title || ''),
      link: item.link,
      originallink: item.originallink,
      pubDate: item.pubDate,
      summary: stripHtml(item.description || '')
    }));

    return NextResponse.json({ source: 'naver', query, items });
  } catch (error) {
    return NextResponse.json({ source: 'mock-fallback', query, items: mockNews(query), error: String(error) });
  }
}
