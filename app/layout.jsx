import { url } from "@/lib/path";
import Ping from "./Ping";
import "./globals.css";

export const metadata = {
  title: "AeroText — 항공 준사고 보고서 구조화 분석",
  description: "ASRS 준사고 보고서에서 방어 시퀀스를 복원하고 근거 원문과 함께 제시한다",
};

const NAV = [["/", "세트"], ["/findings/", "발견 사항"], ["/analysis/", "집계·검색"],
             ["/scoring/", "대조 채점"], ["/rubric/", "기준표"]];

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="text-slate-800">
        <header className="bg-[var(--ink-900)] text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3.5">
            <a href={url("/")} className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight">AeroText</span>
              <span className="text-[13px] text-white/55">항공 준사고 보고서 구조화 분석</span>
            </a>
            <nav className="ml-auto flex gap-1 text-[13px]">
              {NAV.map(([h, l]) => (
                <a key={h} href={url(h)}
                   className="rounded-md px-3 py-1.5 text-white/65 transition-colors duration-200 hover:bg-white/10 hover:text-white">
                  {l}
                </a>
              ))}
            </nav>
            <Ping />
          </div>
          <div className="border-t border-white/10 bg-gradient-to-b from-black/25 to-black/15">
            <p className="mx-auto max-w-6xl px-6 py-2 text-[12px] leading-relaxed text-amber-200/80">
              사람이 다시 확인해야 하는 참고 자료입니다.
              <span className="text-white/60"> 학습이 아니라 국제기구 기준표와 대조해 뽑았고, 모든 값에 근거 원문이 붙습니다.</span>
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>

        <footer className="mt-10 border-t hair">
          <div className="mx-auto max-w-6xl px-6 py-6 text-xs leading-relaxed text-slate-500">
            경상국립대학교 대학원 기술경영학과 · 항공빅데이터개론 바이브코딩 프로젝트 (2026-2) · 김현상
            <br />
            자료 출처: NASA ASRS Database Report Sets. 기관이 비식별 처리해 공개한 자료입니다.
          </div>
        </footer>
      </body>
    </html>
  );
}
