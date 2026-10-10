"use client";
import { url } from "@/lib/path";

import { useMemo, useState } from "react";
import Network from "@/app/Network";
import WhatIf from "@/app/WhatIf";

const FACETS = [
  { key: "set", label: "세트", field: "set" },
  { key: "threats", label: "위협", field: "threats" },
  { key: "detectors", label: "탐지 주체", field: "detectors" },
  { key: "worked", label: "작동한 방어", field: "worked" },
  { key: "breached", label: "뚫린 방어", field: "breached" },
  { key: "outcomes", label: "결과 상태", field: "outcomes" },
];

const LAYER_COLOR = {
  예방: "bg-amber-400", 탐지: "bg-blue-400", 해소: "bg-indigo-400", 복구: "bg-emerald-400",
};

function has(row, field, value) {
  const v = row[field];
  return Array.isArray(v) ? v.includes(value) : v === value;
}

function Status({ value }) {
  const s = value === "일치" ? "border-emerald-300 bg-emerald-50 text-emerald-800"
    : value === "불일치" ? "border-rose-300 bg-rose-50 text-rose-800"
    : "border-slate-300 bg-slate-50 text-slate-600";
  return <span className={`rounded border px-1.5 py-0.5 text-[11px] ${s}`}>{value}</span>;
}

function Bar({ label, worked, breached, total, max, layer, onPick }) {
  return (
    <li className="grid grid-cols-[9.5rem_1fr_4rem] items-center gap-3 text-[13px]">
      <button onClick={onPick} className="truncate text-left text-slate-700 hover:text-blue-700 hover:underline" title="이 방어로 걸러 보기">
        {layer && <span className={`mr-1.5 inline-block h-2 w-2 rounded-full align-middle ${LAYER_COLOR[layer]}`} />}
        {label}
      </button>
      <span className="flex h-4 overflow-hidden rounded-sm bg-slate-100">
        <span className="bar h-full bg-emerald-500/85" style={{ width: `${(worked / max) * 100}%` }} />
        <span className="bar h-full bg-rose-500/85" style={{ width: `${(breached / max) * 100}%` }} />
      </span>
      <span className="text-right tabular-nums text-slate-500">
        {worked}/<span className={breached ? "font-semibold text-rose-700" : ""}>{breached}</span>
      </span>
    </li>
  );
}

export default function Explorer({ rows, facets, layers }) {
  const [sel, setSel] = useState({});
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("breached");
  const [net, setNet] = useState("worked");

  const toggle = (key, value) =>
    setSel((s) => {
      const cur = s[key] || [];
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
      const out = { ...s };
      if (next.length) out[key] = next;
      else delete out[key];
      return out;
    });

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return rows.filter((r) => {
      for (const f of FACETS) {
        const picked = sel[f.key];
        if (picked && !picked.some((v) => has(r, f.field, v))) return false;
      }
      if (text && !`${r.acn} ${r.synopsis}`.toLowerCase().includes(text)) return false;
      return true;
    });
  }, [rows, sel, q]);

  const agg = useMemo(() => {
    const w = {}, b = {};
    for (const r of filtered) {
      for (const v of r.worked) w[v] = (w[v] || 0) + 1;
      for (const v of r.breached) b[v] = (b[v] || 0) + 1;
    }
    const keys = [...new Set([...Object.keys(w), ...Object.keys(b)])];
    const out = keys.map((k) => ({
      label: k, worked: w[k] || 0, breached: b[k] || 0,
      layer: layers[k], total: (w[k] || 0) + (b[k] || 0),
    }));
    out.sort((x, y) => sort === "breached"
      ? y.breached / y.total - x.breached / x.total || y.total - x.total
      : y.total - x.total);
    return out;
  }, [filtered, sort, layers]);

  const lastLines = useMemo(() => {
    const c = {};
    for (const r of filtered) if (r.last_line) c[r.last_line] = (c[r.last_line] || 0) + 1;
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filtered]);

  const max = Math.max(1, ...agg.map((a) => a.total));
  const nBreached = filtered.filter((r) => r.n_breached > 0).length;
  const active = Object.values(sel).flat().length;

  const csv = () => {
    const head = ["세트", "접수번호", "요약", "위협", "탐지 주체", "작동한 방어", "뚫린 방어", "결과 상태", "대조"];
    const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const body = filtered.map((r) => [r.set, r.acn, r.synopsis, r.threats.join(";"),
      r.detectors.join(";"), r.worked.join(";"), r.breached.join(";"),
      r.outcomes.join(";"), r.detector_status].map(esc).join(","));
    const blob = new Blob(["﻿" + [head.map(esc).join(","), ...body].join("\r\n")],
      { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aerotext_${filtered.length}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start">
        <div>
          <label className="text-xs font-medium text-slate-500">접수번호·요약 검색</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="smoke, 2084653 ..."
                 className="mt-1 w-full rounded border border-slate-300 px-2.5 py-1.5 text-[13px] outline-none focus:border-blue-500" />
        </div>
        {FACETS.map((f) => (
          <div key={f.key}>
            <div className="text-xs font-medium text-slate-500">{f.label}</div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {facets[f.key].map((o) => {
                const on = (sel[f.key] || []).includes(o.value);
                return (
                  <button key={o.value} onClick={() => toggle(f.key, o.value)}
                          className={`chip rounded-full border px-2 py-0.5 text-[12px] ${
                            on ? "border-blue-600 bg-blue-600 text-white"
                               : "border-slate-300 bg-white text-slate-600 hover:border-slate-500"}`}>
                    {o.value} <span className="tabular-nums opacity-70">{o.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {active > 0 && (
          <button onClick={() => { setSel({}); setQ(""); }}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-[13px] text-slate-600 hover:border-slate-500">
            조건 {active}개 모두 해제
          </button>
        )}
      </aside>

      <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 card px-5 py-3">
          <div className="text-sm">
            <span className="stat text-[1.7rem]">{filtered.length}</span>
            <span className="ml-1 text-slate-500">건 / 전체 {rows.length}건</span>
            <span className="ml-3 text-slate-400">뚫린 방어 기록 {nBreached}건</span>
          </div>
          <button onClick={csv} disabled={!filtered.length}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-[13px] hover:border-slate-500 disabled:opacity-40">
            CSV 내려받기
          </button>
        </div>

        <div className="card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">위협 · 방어 · 결과 네트워크</h2>
            <div className="flex gap-1 text-[12px]">
              {[["worked", "작동한 방어"], ["breached", "뚫린 방어"]].map(([k, l]) => (
                <button key={k} onClick={() => setNet(k)}
                        className={`rounded border px-2 py-0.5 ${net === k ? "border-slate-700 bg-slate-700 text-white" : "border-slate-300 text-slate-600"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-[13px] text-slate-600">
            띠 두께는 같은 보고에 함께 나타난 횟수입니다. 항목에 마우스를 올리면 연결이 드러나고,
            누르면 그 값으로 걸러집니다.
          </p>
          <div className="mt-3 overflow-x-auto">
            <div className="min-w-[46rem]">
              <Network rows={filtered} layers={layers} mode={net}
                       onPick={(v) => {
                         const key = facets.threats.some((x) => x.value === v) ? "threats"
                           : facets.outcomes.some((x) => x.value === v) ? "outcomes" : net;
                         toggle(key, v);
                       }} />
            </div>
          </div>
        </div>

        {lastLines.length > 0 && (
          <div className="card p-5">
            <h2 className="font-semibold">가장 자주 마지막 차단선이 된 방어</h2>
            <p className="mt-1 text-[13px] text-slate-600">시퀀스에서 마지막으로 작동한 해소·복구 층위 방어입니다.</p>
            <ol className="mt-3 space-y-1.5 text-[13px]">
              {lastLines.map(([k, n], i) => (
                <li key={k} className="grid grid-cols-[1.2rem_10rem_1fr_2.5rem] items-center gap-2">
                  <span className="tabular-nums text-slate-400">{i + 1}</span>
                  <span className="truncate text-slate-700">{k}</span>
                  <span className="h-3 rounded-sm bg-slate-100">
                    <span className="bar block h-full rounded-sm bg-indigo-400"
                          style={{ width: `${(n / lastLines[0][1]) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-slate-500">{n}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">방어별 작동과 뚫림</h2>
            <div className="flex gap-1 text-[12px]">
              {[["breached", "뚫림 비율순"], ["total", "빈도순"]].map(([k, l]) => (
                <button key={k} onClick={() => setSort(k)}
                        className={`rounded border px-2 py-0.5 ${sort === k ? "border-slate-700 bg-slate-700 text-white" : "border-slate-300 text-slate-600"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-[13px] text-slate-600">방어 이름을 누르면 그 방어가 나온 보고만 걸러집니다.</p>
          {agg.length === 0 ? (
            <p className="mt-4 text-[13px] text-slate-500">조건에 맞는 보고가 없습니다.</p>
          ) : (
            <ul className="mt-4 space-y-1.5">
              {agg.map((a) => (
                <Bar key={a.label} {...a} max={max}
                     onPick={() => toggle(a.worked === 0 && a.breached > 0 ? "breached" : "worked", a.label)} />
              ))}
            </ul>
          )}
        </div>

        <WhatIf rows={filtered} layers={layers} />

        <div className="overflow-hidden card">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="font-semibold">사례 {filtered.length}건</h2>
          </div>
          <div className="max-h-[40rem] overflow-y-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 thead border-b border-slate-900/10 text-xs">
                <tr>
                  <th className="px-4 py-2 font-medium">접수번호</th>
                  <th className="px-4 py-2 font-medium">요약</th>
                  <th className="px-4 py-2 font-medium">뚫린 방어</th>
                  <th className="px-4 py-2 text-center font-medium">대조</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.report_id} className="border-b hair last:border-0 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-2.5 align-top">
                      <a href={url(`/set/${r.set}/report/${r.acn}/`)} className="quiet font-medium text-[var(--accent)] underline decoration-1 hover:text-cyan-800">{r.acn}</a>
                      <div className="text-[11px] text-slate-400">{r.set}</div>
                    </td>
                    <td className="max-w-lg px-4 py-2.5 align-top text-slate-700">{r.synopsis}</td>
                    <td className="px-4 py-2.5 align-top text-rose-700">
                      {r.breached.join(", ") || <span className="text-slate-300">없음</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center align-top">
                      <Status value={r.detector_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
