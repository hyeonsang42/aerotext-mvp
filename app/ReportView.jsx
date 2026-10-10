"use client";

import { useState } from "react";

const ITEM_ORDER = ["threat", "detector", "barrier_worked", "barrier_breached", "response", "outcome"];

const LAYER_DOT = {
  예방: "bg-amber-400",
  탐지: "bg-blue-400",
  해소: "bg-indigo-400",
  복구: "bg-emerald-400",
};

function Badge({ text }) {
  const style =
    text === "자동 채점"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
      : text === "참고 대조"
      ? "border-sky-300 bg-sky-50 text-sky-800"
      : text === "이중 주석"
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : "border-slate-300 bg-slate-50 text-slate-600";
  return <span className={`rounded border px-1.5 py-0.5 text-[11px] ${style}`}>{text}</span>;
}

/** 작동한 방어는 실선, 뚫린 방어는 점선으로 구분한다 (화면설계서 4장) */
function stepStyle(item, selected) {
  const base = "w-full rounded px-3 py-2 text-left transition ";
  const ring = selected ? "ring-2 ring-blue-500 " : "";
  if (item === "barrier_breached") return base + ring + "border-2 border-dashed border-rose-400 bg-rose-50";
  if (item === "barrier_worked") return base + ring + "border-2 border-solid border-emerald-400 bg-emerald-50";
  return base + ring + "border border-slate-300 bg-white";
}

function Narrative({ text, span }) {
  if (!span) return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>;
  return (
    <p className="whitespace-pre-wrap leading-relaxed">
      {text.slice(0, span.start)}
      <mark className="evidence" id="evidence">
        {text.slice(span.start, span.end)}
      </mark>
      {text.slice(span.end)}
    </p>
  );
}

export default function ReportView({ report }) {
  const [sel, setSel] = useState(null);
  const steps = report.sequence;
  const orders = [...new Set(steps.map((s) => s.order))].sort((a, b) => a - b);
  const selected = sel === null ? null : steps[sel];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">방어 시퀀스</h2>
          <span className="text-xs text-slate-500">항목을 누르면 근거 원문이 강조됩니다</span>
        </div>

        {steps.length === 0 && (
          <p className="mt-3 rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">
            추출된 항목이 없습니다. {report.notes || "내러티브에 해당하는 서술이 없습니다."}
          </p>
        )}

        <ol className="mt-3 space-y-4">
          {orders.map((o) => (
            <li key={o} className="relative pl-7">
              <span className="absolute left-0 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white tabular-nums">
                {o}
              </span>
              <span className="absolute left-[9px] top-7 h-[calc(100%-1rem)] w-px bg-slate-300" />
              <div className="space-y-2">
                {steps
                  .map((s, i) => [s, i])
                  .filter(([s]) => s.order === o)
                  .sort(([a], [b]) => ITEM_ORDER.indexOf(a.item) - ITEM_ORDER.indexOf(b.item))
                  .map(([s, i]) => (
                    <button key={i} onClick={() => setSel(sel === i ? null : i)} className={stepStyle(s.item, sel === i)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">{s.item_label}</span>
                        {s.item === "barrier_breached" && (
                          <span className="text-[11px] font-semibold text-rose-700">뚫림</span>
                        )}
                        {s.item === "barrier_worked" && (
                          <span className="text-[11px] font-semibold text-emerald-700">작동</span>
                        )}
                        <Badge text={s.scoring} />
                      </div>
                      <div className="mt-0.5 font-medium">{s.label_ko}</div>
                      {s.layer && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <span className={`inline-block h-2 w-2 rounded-full ${LAYER_DOT[s.layer]}`} aria-hidden="true" />
                          {s.layer} · {s.agent}
                        </div>
                      )}
                      {s.asrs_value && (
                        <div className="text-xs text-slate-400">ASRS {s.asrs_value}</div>
                      )}
                    </button>
                  ))}
              </div>
            </li>
          ))}
        </ol>

        {report.notes && (
          <p className="mt-4 rounded border border-slate-200 bg-white p-3 text-[13px] leading-relaxed text-slate-600">
            <span className="font-medium text-slate-500">추출 메모 </span>
            {report.notes}
          </p>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">내러티브 원문</h2>
          <span className="text-xs text-slate-500">신고자 {report.narrative_count}명</span>
        </div>

        {selected ? (
          <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3 text-[13px]">
            <div className="font-medium text-blue-900">
              {selected.item_label} · {selected.label_ko}
            </div>
            {selected.desc && <p className="mt-1 text-blue-800">{selected.desc}</p>}
            <p className="mt-1 text-xs text-blue-700">
              근거 위치 {selected.evidence.start}~{selected.evidence.end}자
            </p>
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-slate-500">
            왼쪽에서 항목을 선택하면 그 판단의 근거가 된 구절이 표시됩니다.
          </p>
        )}

        <div className="mt-3 max-h-[36rem] overflow-y-auto rounded border border-slate-200 bg-white p-4 text-[13px] text-slate-800">
          <Narrative text={report.narrative} span={selected?.evidence} />
        </div>
      </section>
    </div>
  );
}
