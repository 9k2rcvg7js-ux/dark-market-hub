import { NextResponse } from 'next/server';
import { mockStocks } from '@/lib/mock';

export const dynamic = 'force-dynamic';

type KisStock = Record<string, string>;

async function getAccessToken() {
  const baseUrl = process.env.KIS_BASE_URL;
  const appkey = process.env.KIS_APP_KEY;
  const appsecret = process.env.KIS_APP_SECRET;
  if (!baseUrl || !appkey || !appsecret) return null;

  const res = await fetch(`${baseUrl}/oauth2/tokenP`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', appkey, appsecret }),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`KIS token error: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

function mapKisStock(item: KisStock, index: number) {
  return {
    rank: index + 1,
    code: item.mksc_shrn_iscd || item.stck_shrn_iscd || item.iscd || '-',
    name: item.hts_kor_isnm || item.prdt_name || item.name || '종목명 없음',
    market: item.mrkt_cls_name || item.mrkt_div_cls_name || 'KRX',
    price: Number(item.stck_prpr || item.prpr || 0),
    changeRate: Number(item.prdy_ctrt || item.rate || 0),
    volume: Number(item.acml_vol || item.cum_vol || 0)
  };
}

export async function GET() {
  try {
    const baseUrl = process.env.KIS_BASE_URL;
    const appkey = process.env.KIS_APP_KEY;
    const appsecret = process.env.KIS_APP_SECRET;

    if (!baseUrl || !appkey || !appsecret) {
      return NextResponse.json({ source: 'mock', items: mockStocks });
    }

    const token = await getAccessToken();
    if (!token) return NextResponse.json({ source: 'mock', items: mockStocks });

    // 한국투자증권 국내주식 거래량순위 API.
    // 실전 TR_ID: FHPST01710000. KRX 전체 기준, 거래량 내림차순.
    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_COND_SCR_DIV_CODE: '20171',
      FID_INPUT_ISCD: '0000',
      FID_DIV_CLS_CODE: '0',
      FID_BLNG_CLS_CODE: '0',
      FID_TRGT_CLS_CODE: '111111111',
      FID_TRGT_EXLS_CLS_CODE: '0000000000',
      FID_INPUT_PRICE_1: '',
      FID_INPUT_PRICE_2: '',
      FID_VOL_CNT: '',
      FID_INPUT_DATE_1: ''
    });

    const res = await fetch(`${baseUrl}/uapi/domestic-stock/v1/quotations/volume-rank?${params}`, {
      headers: {
        authorization: `Bearer ${token}`,
        appkey,
        appsecret,
        tr_id: 'FHPST01710000',
        custtype: 'P'
      },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`KIS volume-rank error: ${res.status}`);
    const data = await res.json();
    const output = Array.isArray(data.output) ? data.output : [];
    const items = output.slice(0, 10).map(mapKisStock);

    return NextResponse.json({ source: 'kis', items: items.length ? items : mockStocks });
  } catch (error) {
    return NextResponse.json({ source: 'mock-fallback', items: mockStocks, error: String(error) }, { status: 200 });
  }
}
