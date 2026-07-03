import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dark Market Hub',
  description: '국내 주식 거래량 순위와 시장/세계 이슈 뉴스 대시보드'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
