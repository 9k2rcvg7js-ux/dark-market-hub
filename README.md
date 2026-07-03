# Dark Market Hub

어두운 톤의 국내 주식 거래량/뉴스/세계 이슈 대시보드입니다. 기본 실행 주소는 http://localhost:4000 입니다.

## 포함 기능

- 국내 주식 거래량 순위 1~10 표시
- 오늘부터 매일 Top10 등장 횟수 누적 체크
- 종목별 뉴스 링크와 간단 요약 표시
- 한국 주식시장 뉴스: 지수/수급, 반도체/AI, 2차전지/전기차, 바이오/헬스케어
- 새 용어/기술/트렌드 정리 영역
- 세계 이슈: 전쟁/지정학, 자연재해/기후, 새로운 기술, 보건/질병
- 추후 확장용 탭

## 실행 방법

```bash
npm install
npm run dev
```

이 프로젝트는 `package.json`에서 개발 서버 포트를 4000번으로 지정해 두었습니다.

브라우저에서 `http://localhost:4000`을 엽니다.

## 실제 API 연결

`.env.example`을 `.env.local`로 복사하고 값을 넣습니다.

```bash
cp .env.example .env.local
```

### 한국투자증권 Open API

- `KIS_APP_KEY`
- `KIS_APP_SECRET`
- `KIS_BASE_URL`

거래량 순위 API는 `/api/volume-rank`에서 호출합니다. API 키가 없거나 호출이 실패하면 mock 데이터로 자동 대체됩니다.

### 네이버 뉴스 검색 API

- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`

뉴스 API는 `/api/news`, `/api/market-brief`, `/api/world-issues`에서 사용합니다. 키가 없으면 안내용 mock 뉴스가 표시됩니다.

## 누적 횟수 저장 방식

현재 MVP는 브라우저 `localStorage`에 저장합니다. 같은 날짜에 새로고침해도 같은 종목은 한 번만 누적됩니다.

운영 서비스로 만들 때는 `localStorage` 대신 Supabase/Firebase/PostgreSQL에 아래 형태로 저장하는 것을 권장합니다.

```sql
create table daily_volume_rank (
  trade_date date not null,
  stock_code text not null,
  stock_name text not null,
  rank int not null,
  volume bigint,
  created_at timestamptz default now(),
  primary key (trade_date, stock_code)
);
```

## 확장 아이디어

- 관심종목 알림
- AI 뉴스 요약/리스크 분류
- 업종별 히트맵
- 종목별 거래량 등장 추이 차트
- 로그인 후 여러 기기 동기화
