export const mockStocks = [
  { rank: 1, code: '005930', name: '삼성전자', market: 'KOSPI', price: 87300, changeRate: 1.12, volume: 42132000 },
  { rank: 2, code: '000660', name: 'SK하이닉스', market: 'KOSPI', price: 287500, changeRate: 2.35, volume: 23318000 },
  { rank: 3, code: '042660', name: '한화오션', market: 'KOSPI', price: 69100, changeRate: -0.74, volume: 18022000 },
  { rank: 4, code: '373220', name: 'LG에너지솔루션', market: 'KOSPI', price: 416000, changeRate: 0.49, volume: 12654000 },
  { rank: 5, code: '035420', name: 'NAVER', market: 'KOSPI', price: 221500, changeRate: 1.86, volume: 11985000 },
  { rank: 6, code: '035720', name: '카카오', market: 'KOSPI', price: 52700, changeRate: -1.28, volume: 10931000 },
  { rank: 7, code: '086520', name: '에코프로', market: 'KOSDAQ', price: 97200, changeRate: 3.64, volume: 9853000 },
  { rank: 8, code: '247540', name: '에코프로비엠', market: 'KOSDAQ', price: 184200, changeRate: 2.18, volume: 8872000 },
  { rank: 9, code: '068270', name: '셀트리온', market: 'KOSPI', price: 193800, changeRate: 0.31, volume: 8321000 },
  { rank: 10, code: '005380', name: '현대차', market: 'KOSPI', price: 276000, changeRate: -0.18, volume: 7902000 }
];

export const marketSections = [
  {
    title: '지수/수급',
    query: '한국 증시 코스피 코스닥 외국인 기관 수급',
    summary: '코스피·코스닥 흐름, 외국인/기관 매매, 환율과 금리 변화가 시장 분위기를 좌우합니다.'
  },
  {
    title: '반도체/AI',
    query: '한국 반도체 AI HBM 주식',
    summary: 'HBM, AI 서버, 파운드리 투자 뉴스가 대형 반도체 종목의 거래량을 키우는 핵심 재료입니다.'
  },
  {
    title: '2차전지/전기차',
    query: '2차전지 전기차 배터리 한국 주식',
    summary: '리튬 가격, 전기차 수요, IRA/관세 이슈가 배터리 밸류체인의 변동성을 만듭니다.'
  },
  {
    title: '바이오/헬스케어',
    query: '한국 바이오 헬스케어 임상 주식',
    summary: '임상 결과, 기술수출, FDA/EMA 관련 일정이 개별 종목 급등락의 주요 원인입니다.'
  }
];

export const trendTerms = [
  { term: 'HBM', desc: 'AI 가속기에 필요한 고대역폭 메모리. 반도체 대형주의 핵심 성장 키워드입니다.' },
  { term: '온디바이스 AI', desc: '스마트폰·PC 등 기기 내부에서 AI를 처리하는 기술. 반도체와 IT 부품 수요와 연결됩니다.' },
  { term: '밸류업', desc: '상장사의 주주환원과 기업가치 개선을 유도하는 정책·투자 테마입니다.' },
  { term: '순환매', desc: '특정 업종 상승 후 다른 업종으로 매수세가 옮겨가는 흐름입니다.' }
];

export const worldIssueSections = [
  { title: '전쟁/지정학', query: '세계 전쟁 지정학 국제 분쟁 증시 영향' },
  { title: '자연재해/기후', query: '세계 자연재해 기후 폭염 홍수 지진 경제 영향' },
  { title: '새로운 기술', query: 'AI 로봇 반도체 우주 새로운 기술 글로벌 트렌드' },
  { title: '보건/질병', query: '세계 보건 질병 백신 감염병 경제 영향' }
];
