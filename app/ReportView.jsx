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

/**
 * 화면 보는 법.
 * 색과 테두리와 배지가 전부 뜻이 있는데 화면 어디에도 적혀 있지 않았다.
 * 처음 보는 사람은 알 길이 없으므로 왼쪽 맨 위에 붙인다.
 */
function Legend() {
  return (
    <div className="mt-3 space-y-2">
      {/* 두 색의 뜻만은 접지 않는다. 이 화면에서 제일 먼저 틀리는 대목이다 */}
      <div className="rounded border border-slate-300 bg-white px-3.5 py-3 text-[13px]">
        <ul className="space-y-1.5">
          <li className="flex gap-2">
            <span className="mt-px shrink-0 rounded border-2 border-solid border-emerald-400 bg-emerald-50 px-1.5 text-[11px] font-medium text-emerald-800">초록 실선</span>
            <span className="text-slate-700">그 방어가 <b>실제로 제 일을 했다</b></span>
          </li>
          <li className="flex gap-2">
            <span className="mt-px shrink-0 rounded border-2 border-dashed border-rose-400 bg-rose-50 px-1.5 text-[11px] font-medium text-rose-800">빨강 점선</span>
            <span className="text-slate-700">그 방어가 있었는데 <b>실제로 못 막았다</b></span>
          </li>
        </ul>
        <p className="mt-2.5 border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-500">
          둘 다 신고서에 <b>실제로 일어난 일</b>입니다. 했어야 하는 일이나 권고가 아닙니다.
          어느 쪽이든 근거가 된 원문 구절이 붙어 있습니다.
        </p>
      </div>

      <details className="rounded border border-slate-200 bg-slate-50 text-[13px]">
      <summary className="cursor-pointer select-none px-3 py-2 font-medium text-slate-600">
        나머지 표시 보는 법 (순서 숫자, 층위 점 색, 오른쪽 배지)
      </summary>
      <div className="space-y-3 border-t border-slate-200 px-3 py-3 leading-relaxed">
        <div>
          <div className="font-medium text-slate-700">그 밖의 테두리</div>
          <ul className="mt-1 space-y-1 text-slate-600">
            <li>
              <span className="mr-1.5 inline-block rounded border border-slate-300 bg-white px-1.5 text-[11px] text-slate-600">회색 실선</span>
              방어가 아닌 항목 (위협, 탐지 주체, 대응 행동, 결과 상태)
            </li>
            <li>
              <span className="mr-1.5 inline-block rounded px-1.5 text-[11px] ring-2 ring-blue-500">파랑 테두리</span>
              지금 고른 항목. 오른쪽 원문에 근거가 노랗게 표시된다
            </li>
          </ul>
        </div>

        <div>
          <div className="font-medium text-slate-700">왼쪽 검은 동그라미 숫자</div>
          <p className="mt-1 text-slate-600">
            벌어진 순서다. 같은 숫자는 같은 시점에 함께 일어난 일이다.
          </p>
        </div>

        <div>
          <div className="font-medium text-slate-700">작은 점 색깔 (층위)</div>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-slate-600">
            {[["예방", "막는 단계"], ["탐지", "알아채는 단계"], ["해소", "푸는 단계"], ["복구", "수습하는 단계"]].map(([k, d]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${LAYER_DOT[k]}`} aria-hidden="true" />
                {k} · {d}
              </span>
            ))}
          </p>
        </div>

        <div>
          <div className="font-medium text-slate-700">오른쪽 배지 (이 값을 무엇과 맞춰 보는가)</div>
          <ul className="mt-1 space-y-1 text-slate-600">
            <li><Badge text="자동 채점" /> <span className="ml-1">기관이 적어 둔 답이 있어 프로그램이 자동으로 맞춰 본다</span></li>
            <li><Badge text="참고 대조" /> <span className="ml-1">기관 값이 있지만 기준이 달라 점수에는 넣지 않는다</span></li>
            <li><Badge text="이중 주석" /> <span className="ml-1">맞춰 볼 기관 값이 없다. 사람 둘이 따로 읽어 같은지 확인한다</span></li>
            <li><Badge text="대조 없음" /> <span className="ml-1">맞춰 볼 대상 자체가 없다</span></li>
          </ul>
        </div>
      </div>
      </details>
    </div>
  );
}

/**
 * 같은 방어가 작동과 뚫림 양쪽에 나오는 경우를 찾는다.
 * 순서를 같이 기록해야 보이는 것이고, 이 시스템을 만든 이유 자체다.
 * 지금까지는 사람이 눈으로 3번과 6번을 찾아야 했다. 화면이 먼저 말하게 한다.
 */
function flippedBarriers(steps) {
  const worked = {};
  const breached = {};
  for (const s of steps) {
    if (s.item === "barrier_worked") (worked[s.label_ko] = worked[s.label_ko] || []).push(s.order);
    if (s.item === "barrier_breached") (breached[s.label_ko] = breached[s.label_ko] || []).push(s.order);
  }
  return Object.keys(worked)
    .filter((name) => breached[name])
    .map((name) => ({ name, worked: worked[name], breached: breached[name] }));
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

export default function ReportView({ report, evidenceKo = {} }) {
  const [sel, setSel] = useState(null);
  const steps = report.sequence;
  const orders = [...new Set(steps.map((s) => s.order))].sort((a, b) => a - b);
  const selected = sel === null ? null : steps[sel];
  const flips = flippedBarriers(steps);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">방어 시퀀스</h2>
          <span className="text-xs text-slate-500">항목을 누르면 근거 원문이 강조됩니다</span>
        </div>

        <Legend />

        {flips.length > 0 && (
          <div className="mt-2 rounded border border-indigo-300 bg-indigo-50 px-3.5 py-3 text-[13px] leading-relaxed">
            <div className="font-semibold text-indigo-900">같은 방어가 한 번은 작동하고 한 번은 뚫렸습니다</div>
            <ul className="mt-1.5 space-y-1 text-indigo-900/90">
              {flips.map((f) => (
                <li key={f.name}>
                  <b>{f.name}</b>
                  <span className="text-indigo-800/80">
                    {" "}: {f.worked.join("번, ")}번에서 작동 / {f.breached.join("번, ")}번에서 뚫림
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 border-t border-indigo-200 pt-2 text-xs leading-relaxed text-indigo-800/75">
              방어를 가졌는지 아닌지만 적으면 이 구분이 사라집니다. 벌어진 순서를 같이 기록하기 때문에
              보입니다. 기관 코딩 필드에는 이것을 적는 칸이 없습니다.
            </p>
          </div>
        )}

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
          <span className="text-xs text-slate-500">신고자 {report.narrative_count}명 · 영어 원문</span>
        </div>

        {selected ? (
          <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3 text-[13px]">
            <div className="font-medium text-blue-900">
              {selected.item_label} · {selected.label_ko}
            </div>
            {selected.desc && <p className="mt-1 text-blue-800">{selected.desc}</p>}
            <p className="mt-2 border-t border-blue-200 pt-2 text-xs leading-relaxed text-blue-800/80">
              이 값은 기준표 {report.meta?.rubric_version}에 미리 적어 둔 목록에서 고른 것입니다.
              프로그램이 말을 지어내지 않습니다. 고를 근거가 원문에 없으면 아무것도 고르지 않습니다.
            </p>
            {/* 원문이 영어라 뜻을 모르면 근거를 봐도 소용이 없다. 옮긴 것이 있으면 같이 보인다 */}
            {evidenceKo[selected.evidence.quote] && (
              <div className="mt-2 rounded border border-blue-200 bg-white px-2.5 py-2">
                <div className="text-[11px] font-medium text-blue-700">근거 구절을 우리말로</div>
                <p className="mt-0.5 text-blue-900">{evidenceKo[selected.evidence.quote]}</p>
              </div>
            )}
            <p className="mt-2 text-xs text-blue-700">
              아래 원문에서 <mark className="evidence px-1">노랗게 칠한 부분</mark>이 이 판단의 근거입니다
              ({selected.evidence.start}~{selected.evidence.end}자)
            </p>
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-slate-500">
            왼쪽에서 항목을 누르면 그 판단의 근거가 된 구절이 아래 원문에서 노랗게 칠해집니다.
            원문은 신고자가 영어로 쓴 글 그대로입니다.
          </p>
        )}

        <div className="mt-3 max-h-[36rem] overflow-y-auto rounded border border-slate-200 bg-white p-4 text-[13px] text-slate-800">
          <Narrative text={report.narrative} span={selected?.evidence} />
        </div>
      </section>
    </div>
  );
}
