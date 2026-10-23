"use client";

/**
 * 상단 접속 상태 표시.
 *
 * 서버가 없는 정적 사이트라 따로 잴 API 가 없다.
 * 그래서 public/ping.txt (3바이트) 를 HEAD 로 받아 왕복 시간을 잰다.
 * 주소마다 basePath 가 다르므로 url() 로 만든다.
 *
 * 로컬에서 띄웠을 때도 그대로 동작한다. 닿지 않으면 "연결 없음" 이 된다.
 */

import { useEffect, useState } from "react";
import { url } from "@/lib/path";

const PERIOD = 5000;   // 5초마다 다시 잰다
const TIMEOUT = 3000;  // 3초를 넘기면 닿지 않는 것으로 본다

// 지연에 따른 점 색. Tailwind 는 클래스 이름을 통째로 읽으므로 온전한 이름으로 적는다
function dotColor(ms) {
  if (ms === null) return "bg-white/30";
  if (ms < 100) return "bg-emerald-400";
  if (ms < 400) return "bg-amber-400";
  return "bg-rose-400";
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

  return (
    <span
      className="flex shrink-0 items-center gap-1.5 text-[12px] tabular-nums text-white/55"
      title={ms === null ? "서버에 닿지 않는다" : `접속 응답 시간 ${ms}밀리초`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor(ms)}`} />
      {ms === null ? "연결 없음" : `${ms}ms`}
    </span>
  );
}
