/**
 * 화면에 쓰는 그림. 전부 직접 그린 SVG다.
 * 외부 이미지를 쓰지 않으므로 저작권·이용조건 확인 대상이 아니다
 * (문제정의서 15항). 출판 시 "직접 제작"으로 기록한다.
 */

const LAYER_COLOR = {
  예방: { fill: "#fde68a", stroke: "#d97706" },
  탐지: { fill: "#bfdbfe", stroke: "#2563eb" },
  해소: { fill: "#c7d2fe", stroke: "#4f46e5" },
  복구: { fill: "#bbf7d0", stroke: "#059669" },
};

/** 방어 층위 그림. 구멍 크기가 실제 뚫림 비율에 비례한다. */
export function DefenseLayers({ layers }) {
  const W = 760, H = 220, x0 = 150, gap = 128;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
         aria-label="위협이 예방·탐지·해소·복구 네 겹의 방어를 지나는 그림. 구멍 크기는 실제 뚫림 비율에 비례한다.">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#b91c1c" />
        </marker>
      </defs>

      <text x="14" y="96" className="fill-rose-700 text-[13px] font-semibold">위협</text>
      <text x="14" y="114" className="fill-slate-500 text-[11px]">연기·고장·정비 결함</text>
      <circle cx="108" cy="104" r="13" fill="#fecaca" stroke="#b91c1c" strokeWidth="2" />

      {layers.map((l, i) => {
        const x = x0 + i * gap;
        const c = LAYER_COLOR[l.layer];
        const hole = 8 + (l.breach_rate / 100) * 46;
        return (
          <g key={l.layer}>
            <rect x={x} y="38" width="34" height="132" rx="6" fill={c.fill} stroke={c.stroke} strokeWidth="2" />
            <rect x={x} y={104 - hole / 2} width="34" height={hole} fill="#f8fafc" />
            <line x1={x} y1={104 - hole / 2} x2={x + 34} y2={104 - hole / 2} stroke={c.stroke} strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1={x} y1={104 + hole / 2} x2={x + 34} y2={104 + hole / 2} stroke={c.stroke} strokeWidth="1.5" strokeDasharray="3 2" />
            <text x={x + 17} y="28" textAnchor="middle" className="fill-slate-700 text-[13px] font-semibold">{l.layer}</text>
            <text x={x + 17} y="188" textAnchor="middle" className="fill-slate-500 text-[11px] tabular-nums">뚫림 {l.breach_rate}%</text>
            <text x={x + 17} y="202" textAnchor="middle" className="fill-slate-400 text-[10px] tabular-nums">{l.worked}/{l.total}</text>
          </g>
        );
      })}

      <line x1="124" y1="104" x2={x0 + 2 * gap + 20} y2="104" stroke="#b91c1c" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#arrow)" />
      <text x={x0 + 3 * gap + 46} y="98" className="fill-emerald-700 text-[13px] font-semibold">준사고로 끝남</text>
      <text x={x0 + 3 * gap + 46} y="116" className="fill-slate-500 text-[11px]">사고로 번지지 않음</text>
    </svg>
  );
}

const SET_ART = {
  cabin_fumes: (
    <>
      <path d="M14 34c0-7 8-7 8-14s-8-7-8-14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M24 34c0-7 8-7 8-14s-8-7-8-14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M34 34c0-7 8-7 8-14s-8-7-8-14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.35" />
    </>
  ),
  mechanic: (
    <>
      <path d="M31 9a9 9 0 1 0 8 8l-5 5-8-8 5-5z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <path d="M26 22 12 36a4 4 0 0 0 6 6l14-14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
    </>
  ),
};

export function SetIcon({ set, className = "" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {SET_ART[set] || <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2.5" fill="none" />}
    </svg>
  );
}

/** 방어별 작동 대 뚫림 가로 막대. 색만으로 구분하지 않고 숫자를 병기한다 (NFR-07). */
export function BarrierBars({ barriers }) {
  const max = Math.max(...barriers.map((b) => b.total));
  return (
    <ul className="space-y-1.5">
      {barriers.map((b) => (
        <li key={b.code} className="grid grid-cols-[9.5rem_1fr_3.5rem] items-center gap-3 text-[13px]">
          <span className="truncate text-slate-700" title={`${b.layer}·${b.agent}`}>{b.label_ko}</span>
          <span className="flex h-4 overflow-hidden rounded-sm bg-slate-100">
            <span className="h-full bg-emerald-500/80" style={{ width: `${(b.worked / max) * 100}%` }} title={`작동 ${b.worked}`} />
            <span className="h-full bg-rose-500/80" style={{ width: `${(b.breached / max) * 100}%` }} title={`뚫림 ${b.breached}`} />
          </span>
          <span className="text-right tabular-nums text-slate-500">
            {b.worked}/<span className={b.breached ? "font-semibold text-rose-700" : ""}>{b.breached}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
