"use client";
import { url } from "@/lib/path";

import { useMemo, useState } from "react";

const LAYER_DOT = {
  예방: "bg-amber-400", 탐지: "bg-blue-400", 해소: "bg-indigo-400", 복구: "bg-emerald-400",
};

/**
 * FR-09 방어 제거 가정 분석.
 * 어떤 방어가 그 보고에서 유일하게 작동한 방어였던 사례를 센다.
 * 예측이 아니라 관측된 사례의 집계다. 그 점을 화면에 명시한다.
 */
export default function WhatIf({ rows, layers }) {
  const [pick, setPick] = useState(null);

  const solo = useMemo(() => {
    const m = {};
    for (const r of rows) {
      if (r.worked.length !== 1) continue;
      const b = r.worked[0];
      (m[b] = m[b] || []).push(r);
    }
    return Object.entries(m)
      .map(([label, cases]) => ({ label, cases, n: cases.length, layer: layers[label] }))
      .sort((a, b) => b.n - a.n);
  }, [rows, layers]);

  const total = rows.length;
  const soloTotal = solo.reduce((s, x) => s + x.n, 0);
  const sel = solo.find((x) => x.label === pick) || null;

  const outcomes = useMemo(() => {
    if (!sel) return [];
    const c = {};
    let none = 0;
    for (const r of sel.cases) {
      if (!r.outcomes.length) none += 1;
      for (const o of r.outcomes) c[o] = (c[o] || 0) + 1;
    }
    const list = Object.entries(c).sort((a, b) => b[1] - a[1]);
    if (none) list.push(["서술 없음", none]);
    return list;
  }, [sel]);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">방어 제거 가정 분석</h2>
        <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-900">
          관측 집계이며 예측 아님
        </span>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
        어떤 방어가 그 보고에서 <strong className="font-semibold">유일하게 작동한 방어</strong>였던
        사례를 셉니다. 그 한 겹이 없었다면 남은 방어가 없었다는 뜻입니다. 지금 조건에 걸린{" "}
        {total}건 가운데 {soloTotal}건이 여기에 해당합니다. 이 수치는 실제로 그렇게 기록된 보고를
        센 것이며, 방어를 없앴을 때 무슨 일이 일어날지 예측한 값이 아닙니다.
      </p>

      {solo.length === 0 ? (
        <p className="mt-4 text-[13px] text-slate-500">
          조건에 맞는 사례가 없습니다. 작동한 방어가 하나뿐인 보고가 있어야 합니다.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-1.5">
            {solo.map((x) => (
              <li key={x.label}>
                <button
                  onClick={() => setPick(pick === x.label ? null : x.label)}
                  className={`grid w-full grid-cols-[11rem_1fr_3rem] items-center gap-3 rounded px-2 py-1.5 text-left text-[13px] transition ${
                    pick === x.label ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate text-slate-700">
                    <span className={`mr-1.5 inline-block h-2 w-2 rounded-full align-middle ${LAYER_DOT[x.layer]}`} />
                    {x.label}
                  </span>
                  <span className="h-3 rounded-sm bg-slate-100">
                    <span className="bar block h-full rounded-sm bg-indigo-400"
                          style={{ width: `${(x.n / solo[0].n) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-slate-500">{x.n}건</span>
                </button>
              </li>
            ))}
          </ul>

          {sel && (
            <div className="mt-4 rounded-md border hair bg-slate-50/60 p-4">
              <p className="text-[13px] leading-relaxed text-slate-700">
                <strong className="font-semibold">{sel.label}</strong>가 유일하게 작동한 방어였던
                보고는 <strong className="font-semibold tabular-nums">{sel.n}건</strong>입니다.
                아래는 그 {sel.n}건이 실제로 어떻게 끝났는지의 분포입니다.
              </p>

              <ul className="mt-3 space-y-1 text-[13px]">
                {outcomes.map(([k, n]) => (
                  <li key={k} className="grid grid-cols-[9rem_1fr_2.5rem] items-center gap-2">
                    <span className="truncate text-slate-600">{k}</span>
                    <span className="h-2.5 rounded-sm bg-slate-200/70">
                      <span className="bar block h-full rounded-sm bg-emerald-500/70"
                            style={{ width: `${(n / outcomes[0][1]) * 100}%` }} />
                    </span>
                    <span className="text-right tabular-nums text-slate-500">{n}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 border-t hair pt-3">
                <div className="text-xs font-medium text-slate-500">해당 사례</div>
                <ul className="mt-1.5 space-y-1 text-[13px]">
                  {sel.cases.map((r) => (
                    <li key={r.report_id} className="flex gap-2">
                      <a href={url(`/set/${r.set}/report/${r.acn}/`)}
                         className="quiet shrink-0 font-medium text-[var(--accent)] underline decoration-1 hover:text-cyan-800">
                        {r.acn}
                      </a>
                      <span className="truncate text-slate-600">{r.synopsis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        작동한 방어와 뚫린 방어는 대조할 기관 코딩 필드가 없어 자동 채점되지 않습니다. 이중
        주석으로 검증하는 항목이므로, 여기 숫자는 추출 결과에 대한 집계로 읽어야 합니다.
      </p>
    </div>
  );
}
