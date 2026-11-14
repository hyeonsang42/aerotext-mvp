"use client";

/**
 * 상단 접속 상태 표시.
 *
 * 서버가 없는 정적 사이트라 따로 잴 API 가 없다.
 * 그래서 public/ping.txt (3바이트) 를 HEAD 로 받아 왕복 시간을 잰다.
 * 주소마다 basePath 가 다르므로 url() 로 만든다.
 *
 * 로컬에서 띄웠을 때도 그대로 동작한다. 닿지 않으면 "연결 없음" 이 된다.
 *
 * 표시는 점과 응답 시간, 그리고 오른쪽에 와이파이 모양 막대다.
 * 막대는 색과 켜진 호의 개수가 함께 바뀐다. 색만으로 구분하지 않게 하기 위해서다.
 */

import { useEffect, useState } from "react";
import { url } from "@/lib/path";

const PERIOD = 5000;   // 5초마다 다시 잰다
const TIMEOUT = 3000;  // 3초를 넘기면 닿지 않는 것으로 본다

/* 지연 구간. Tailwind 는 클래스 이름을 통째로 읽으므로 온전한 이름으로 적는다.
   bars 는 켜지는 호의 개수(0~3)다. */
const LEVELS = [
  { max: 100,      bars: 3, dot: "bg-emerald-400", wifi: "text-emerald-400", label: "좋음" },
  { max: 250,      bars: 2, dot: "bg-yellow-400",  wifi: "text-yellow-400",  label: "보통" },
  { max: 400,      bars: 1, dot: "bg-orange-400",  wifi: "text-orange-400",  label: "느림" },
  { max: Infinity, bars: 1, dot: "bg-rose-400",    wifi: "text-rose-400",    label: "아주 느림" },
];
const OFFLINE = { bars: 0, dot: "bg-white/30", wifi: "text-rose-500", label: "연결 없음" };

function levelOf(ms) {
  return ms === null ? OFFLINE : LEVELS.find((l) => ms < l.max);
}

/** 와이파이 막대. 가운데 점 하나와 호 세 개. 꺼진 호는 흐리게 둔다. */
function WifiIcon({ level }) {
  const on = level.bars;
  const dim = "rgba(255,255,255,0.18)";
  const lit = (i) => (on >= i ? "currentColor" : dim);
  return (
    <svg viewBox="0 0 16 13" width="15" height="12" aria-hidden="true"
         className={level.wifi} fill="none" strokeLinecap="round">
      <path d="M1.2 4.1a10.5 10.5 0 0 1 13.6 0" stroke={lit(3)} strokeWidth="1.6" />
      <path d="M3.9 7a7 7 0 0 1 8.2 0" stroke={lit(2)} strokeWidth="1.6" />
      <path d="M6 9.6a3.4 3.4 0 0 1 4 0" stroke={lit(1)} strokeWidth="1.6" />
      <circle cx="8" cy="11.8" r="1.1" fill={on > 0 ? "currentColor" : dim} />
      {/* 닿지 않을 때는 빗금을 그어 색을 못 보는 경우에도 구분되게 한다 */}
      {on === 0 && <path d="M2.2 12.2 L13.8 1.2" stroke="currentColor" strokeWidth="1.6" />}
    </svg>
  );
}

export default function Ping() {
  const [ms, setMs] = useState(null);

  useEffect(() => {
    let alive = true;
    let busy = false;

    async function measure() {
      if (busy) return;   // 응답이 느릴 때 요청이 겹치지 않게 한다
      busy = true;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
      const t0 = performance.now();
      try {
        const r = await fetch(url(`/ping.txt?t=${Date.now()}`), {
          method: "HEAD",
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (!r.ok) throw new Error(String(r.status));
        if (alive) setMs(Math.round(performance.now() - t0));
      } catch {
        if (alive) setMs(null);
      } finally {
        clearTimeout(timer);
        busy = false;
      }
    }

    measure();
    const loop = setInterval(measure, PERIOD);
    return () => {
      alive = false;
      clearInterval(loop);
    };
  }, []);

  const level = levelOf(ms);

  return (
    <span
      className="flex shrink-0 items-center gap-1.5 text-[12px] tabular-nums text-white/55"
      title={ms === null
        ? "서버에 닿지 않는다"
        : `접속 응답 시간 ${ms}밀리초 · 연결 상태 ${level.label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${level.dot}`} />
      {ms === null ? "연결 없음" : `${ms}ms`}
      <WifiIcon level={level} />
    </span>
  );
}
