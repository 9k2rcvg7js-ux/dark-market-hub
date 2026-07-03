'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatNumber, stripHtml, todayKorea } from '@/lib/format';

type Stock = {
  rank: number;
  code: string;
  name: string;
  market: string;
  price: number;
  changeRate: number;
  volume: number;
};

type NewsItem = {
  title: string;
  link: string;
  originallink?: string;
  pubDate?: string;
  summary: string;
};

type CountStore = {
  startedAt: string;
  seenDates: Record<string, string[]>;
  counts: Record<string, { name: string; count: number; lastRank: number; lastSeen: string }>;
};

const tabs = [
  { id: 'volume', label: '거래량 순위' },
  { id: 'market', label: '한국 주식시장 뉴스' },
  { id: 'world', label: '세계 이슈' },
  { id: 'extend', label: '추후 확장' }
] as const;

type TabId = (typeof tabs)[number]['id'];

const emptyStore = (): CountStore => ({ startedAt: todayKorea(), seenDates: {}, counts: {} });

function loadCounts(): CountStore {
  if (typeof window === 'undefined') return emptyStore();
  const saved = window.localStorage.getItem('dark-market-hub-counts');
  if (!saved) return emptyStore();
  try {
    return JSON.parse(saved) as CountStore;
  } catch {
    return emptyStore();
  }
}

function saveCounts(store: CountStore) {
  window.localStorage.setItem('dark-market-hub-counts', JSON.stringify(store));
}

function recordTodayRanking(stocks: Stock[]) {
  const store = loadCounts();
  const today = todayKorea();
  const seenCodes = new Set(store.seenDates[today] || []);
  const next: CountStore = {
    ...store,
    seenDates: { ...store.seenDates, [today]: [...seenCodes] },
    counts: { ...store.counts }
  };

  stocks.slice(0, 10).forEach((stock) => {
    const key = stock.code;
    if (!seenCodes.has(key)) {
      const prev = next.counts[key]?.count || 0;
      next.counts[key] = { name: stock.name, count: prev + 1, lastRank: stock.rank, lastSeen: today };
      seenCodes.add(key);
    } else {
      next.counts[key] = {
        name: stock.name,
        count: next.counts[key]?.count || 1,
        lastRank: stock.rank,
        lastSeen: today
      };
    }
  });

  next.seenDates[today] = [...seenCodes];
  saveCounts(next);
  return next;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('volume');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [counts, setCounts] = useState<CountStore>(emptyStore());
  const [stockNewsTitle, setStockNewsTitle] = useState('거래량 상위 종목을 선택하세요');
  const [stockNews, setStockNews] = useState<NewsItem[]>([]);
  const [marketBrief, setMarketBrief] = useState<any>(null);
  const [worldIssues, setWorldIssues] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('');

  const totalTracked = useMemo(() => Object.keys(counts.counts || {}).length, [counts]);
  const topRepeated = useMemo(() => {
    const list = Object.entries(counts.counts || {}).sort((a, b) => b[1].count - a[1].count);
    return list[0]?.[1];
  }, [counts]);

  async function loadStocks() {
    setLoading(true);
    const res = await fetch('/api/volume-rank', { cache: 'no-store' });
    const data = await res.json();
    setSource(data.source || 'unknown');
    const items: Stock[] = data.items || [];
    setStocks(items);
    setCounts(recordTodayRanking(items));
    setLoading(false);
  }

  async function loadStockNews(stock: Stock) {
    setStockNewsTitle(`${stock.name} 관련 뉴스`);
    const res = await fetch(`/api/news?query=${encodeURIComponent(`${stock.name} ${stock.code} 주식`)}&display=5`, { cache: 'no-store' });
    const data = await res.json();
    setStockNews(data.items || []);
  }

  async function loadMarketBrief() {
    const res = await fetch('/api/market-brief', { cache: 'no-store' });
    setMarketBrief(await res.json());
  }

  async function loadWorldIssues() {
    const res = await fetch('/api/world-issues', { cache: 'no-store' });
    setWorldIssues(await res.json());
  }

  function resetCounts() {
    const next = emptyStore();
    saveCounts(next);
    setCounts(next);
  }

  useEffect(() => {
    setCounts(loadCounts());
    loadStocks();
    loadMarketBrief();
    loadWorldIssues();
  }, []);

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-card">
          <div className="eyebrow">DARK MARKET HUB</div>
          <h1>거래량·뉴스·이슈를 한눈에</h1>
          <p>
            국내 주식 거래량 1~10위를 매일 기록하고, 종목별 뉴스와 한국 주식시장 이슈,
            세계 이슈를 탭으로 분리해 볼 수 있는 다크 톤 대시보드입니다.
          </p>
        </div>
        <div className="metric-grid">
          <div className="metric-card">
            <span className="label">오늘 기준</span>
            <span className="value">{todayKorea()}</span>
            <div className="sub">한국 시간 기준 자동 기록</div>
          </div>
          <div className="metric-card">
            <span className="label">누적 체크 종목</span>
            <span className="value">{totalTracked}</span>
            <div className="sub">브라우저 localStorage 저장</div>
          </div>
          <div className="metric-card">
            <span className="label">최다 등장</span>
            <span className="value">{topRepeated ? `${topRepeated.name}` : '-'}</span>
            <div className="sub">{topRepeated ? `${topRepeated.count}회 Top10` : '아직 기록 없음'}</div>
          </div>
        </div>
      </section>

      <nav className="tabs" aria-label="대시보드 탭">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'volume' && (
        <section className="panel">
          <div className="toolbar">
            <div>
              <h2>국내 주식 거래량 순위 1~10</h2>
              <div className="footer-note">데이터 소스: {source || 'loading'} · API 키가 없으면 데모 데이터로 표시됩니다.</div>
            </div>
            <div className="toolbar-actions">
              <button className="ghost-btn" onClick={resetCounts}>누적 기록 초기화</button>
              <button className="primary-btn" onClick={loadStocks}>{loading ? '갱신 중...' : '순위 새로고침'}</button>
            </div>
          </div>

          <div className="stock-list">
            {stocks.map((stock) => {
              const count = counts.counts?.[stock.code]?.count || 0;
              return (
                <article className="stock-row" key={stock.code}>
                  <div className="rank-badge">{stock.rank}</div>
                  <div>
                    <div className="stock-name">{stock.name}</div>
                    <div className="stock-code">{stock.code} · {stock.market}</div>
                  </div>
                  <div>
                    <span className="data-label">현재가</span>
                    <span className="data-value">{formatNumber(stock.price)}원</span>
                  </div>
                  <div>
                    <span className="data-label">등락률</span>
                    <span className={`data-value ${stock.changeRate >= 0 ? 'up' : 'down'}`}>{stock.changeRate}%</span>
                  </div>
                  <div>
                    <span className="data-label">거래량</span>
                    <span className="data-value">{formatNumber(stock.volume)}</span>
                  </div>
                  <div>
                    <span className="data-label">Top10 등장</span>
                    <span className="data-value">{count}회</span>
                  </div>
                  <button className="news-btn" onClick={() => loadStockNews(stock)}>뉴스 보기</button>
                </article>
              );
            })}
          </div>

          <div className="panel" style={{ marginTop: 18, boxShadow: 'none' }}>
            <div className="toolbar"><h2>{stockNewsTitle}</h2></div>
            {stockNews.length ? <NewsGrid items={stockNews} /> : <div className="empty">종목의 “뉴스 보기” 버튼을 누르면 뉴스 링크와 요약이 표시됩니다.</div>}
          </div>
        </section>
      )}

      {activeTab === 'market' && (
        <section className="panel">
          <div className="toolbar">
            <h2>한국 주식시장 뉴스 / 파트별 정리</h2>
            <button className="primary-btn" onClick={loadMarketBrief}>시장 뉴스 갱신</button>
          </div>
          <div className="section-grid">
            {(marketBrief?.sections || []).map((section: any) => (
              <div className="section-card" key={section.title}>
                <h3>{section.title}</h3>
                <p className="footer-note">{section.summary}</p>
                <MiniNews news={section.news} fallbackQuery={section.query} />
              </div>
            ))}
          </div>
          <h2 style={{ marginTop: 24 }}>새 용어 / 기술 / 트렌드</h2>
          <div className="term-grid">
            {(marketBrief?.trendTerms || []).map((item: any) => (
              <div className="term-card" key={item.term}>
                <strong>{item.term}</strong>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'world' && (
        <section className="panel">
          <div className="toolbar">
            <h2>세계 이슈 정리</h2>
            <button className="primary-btn" onClick={loadWorldIssues}>세계 이슈 갱신</button>
          </div>
          <div className="section-grid">
            {(worldIssues?.sections || []).map((section: any) => (
              <div className="section-card" key={section.title}>
                <h3>{section.title}</h3>
                <MiniNews news={section.news} fallbackQuery={section.query} />
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'extend' && (
        <section className="panel">
          <h2>추후 추가하기 쉽게 만든 영역</h2>
          <div className="section-grid" style={{ marginTop: 16 }}>
            <div className="section-card"><h3>관심종목 탭</h3><p className="footer-note">사용자가 직접 종목을 저장하고 뉴스/거래량 변화를 추적할 수 있습니다.</p></div>
            <div className="section-card"><h3>알림 기능</h3><p className="footer-note">특정 종목이 거래량 Top10에 들어오면 알림을 보내는 기능을 붙일 수 있습니다.</p></div>
            <div className="section-card"><h3>DB 저장</h3><p className="footer-note">현재는 브라우저 저장 방식입니다. Supabase, PostgreSQL, Firebase로 바꾸면 여러 기기에서 공유됩니다.</p></div>
            <div className="section-card"><h3>AI 요약 고도화</h3><p className="footer-note">뉴스 원문을 가져와 3줄 요약, 리스크 요인, 관련 테마까지 분리할 수 있습니다.</p></div>
          </div>
        </section>
      )}

      <p className="footer-note">
        투자 판단용 확정 정보가 아닌 뉴스/시세 모니터링 대시보드입니다. 실제 서비스에서는 API 호출 제한, 저작권, 투자자 고지 문구, 캐싱 정책을 반드시 점검하세요.
      </p>
    </main>
  );
}

function NewsGrid({ items }: { items: NewsItem[] }) {
  return (
    <div className="news-grid">
      {items.map((item, index) => (
        <article className="news-card" key={`${item.link}-${index}`}>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
          <div className="news-meta">{item.pubDate ? new Date(item.pubDate).toLocaleString('ko-KR') : ''}</div>
          <a href={item.originallink || item.link} target="_blank" rel="noreferrer">뉴스 원문 열기 →</a>
        </article>
      ))}
    </div>
  );
}

function MiniNews({ news, fallbackQuery }: { news?: any[]; fallbackQuery: string }) {
  if (!news?.length) {
    return <div className="empty">“{fallbackQuery}” 뉴스가 이곳에 표시됩니다. 네이버 API 키를 넣으면 실제 기사로 바뀝니다.</div>;
  }
  return (
    <div className="stock-list">
      {news.slice(0, 3).map((item, index) => (
        <a className="news-card" key={`${item.link}-${index}`} href={item.originallink || item.link} target="_blank" rel="noreferrer">
          <h3>{stripHtml(item.title || '')}</h3>
          <p>{stripHtml(item.description || '')}</p>
        </a>
      ))}
    </div>
  );
}
