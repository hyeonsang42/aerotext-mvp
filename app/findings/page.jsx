import { url } from "@/lib/path";
import { setKo } from "@/lib/sets";
import { getFindings, getBarriers, getScoring, getGeneralization } from "@/lib/data";

export const metadata = { title: "발견 사항 — AeroText" };

function Case({ c }) {
  return (
    <figure className="border-l-2 border-slate-300 pl-4">
      <blockquote className="text-[13px] leading-relaxed text-slate-700">
        {c.quote}
      </blockquote>
      <figcaption className="mt-1.5 text-[12px] text-slate-500">
        <a href={url(`/set/${c.set}/report/${c.acn}/`)} className="quiet font-medium text-[var(--accent)] underline decoration-1 hover:text-cyan-800">
          ACN {c.acn}
        </a>
        <span className="mx-1.5 text-slate-300">·</span>
        <span className="text-slate-400">{setKo(c.set)}</span>
        {c.note && (
          <>
            <span className="mx-1.5 text-slate-300">·</span>
            {c.note}
          </>
        )}
      </figcaption>
    </figure>
  );
}

export default function FindingsPage() {
  const f = getFindings();
  const b = getBarriers();
  const s = getScoring();
  const g = getGeneralization();

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-[1.35rem] font-bold">발견 사항</h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          한 건만 읽으면 보이지 않고, 보고 {b.reports}건을 <b>같은 기준으로 모았을 때 비로소 보인 것들</b>입니다.
          한 건에서는 개인의 실수로 보이던 일이, 여러 건을 겹쳐 놓으면 문서나 절차의 구멍으로 드러납니다.
          인용문은 전부 원문 그대로이며, 빌드할 때마다 해당 보고의 내러티브에 실제로 있는지 검사합니다.
          접수번호를 누르면 그 보고의 전체 원문과 근거 구절로 이동합니다.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">한눈에</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["처리한 보고", `${b.reports}건`, `추출 항목 ${b.worked_total + b.breached_total}개`],
            ["뚫린 방어가 기록된 보고", `${b.breached_reports}건`, `${Math.round((b.breached_reports / b.reports) * 100)}%`],
            ["기관 답과 일치", `${s.match_rate}%`, `읽지 않고 찍으면 ${s.baseline_rate}%`],
            g ? ["안 열어 본 자료에서", `${g.holdout.match_rate}%`, `${g.drop}%p만 하락`]
              : ["예방 층위 뚫림", `${b.layers[0].breach_rate}%`, "복구 층위는 0%"],
          ].map(([k, v, sub]) => (
            <div key={k} className="rounded-md border hair px-3 py-2.5">
              <div className="text-xs text-slate-500">{k}</div>
              <div className="mt-0.5 stat text-xl">{v}</div>
              <div className="text-xs text-slate-400">{sub}</div>
            </div>
          ))}
        </div>
        <ul className="mt-4 space-y-1 text-[13px] text-slate-600">
          {b.layers.map((l) => (
            <li key={l.layer} className="grid grid-cols-[3rem_1fr_3.5rem] items-center gap-3">
              <span className="text-slate-700">{l.layer}</span>
              <span className="h-2.5 rounded-sm bg-slate-100">
                <span className="bar block h-full rounded-sm bg-rose-400" style={{ width: `${l.breach_rate}%` }} />
              </span>
              <span className="text-right tabular-nums text-slate-500">뚫림 {l.breach_rate}%</span>
            </li>
          ))}
        </ul>
      </section>

      {f.findings.map((x, i) => (
        <article key={x.id} className="card p-6">
          <div className="flex items-baseline gap-3">
            <span className="stat text-[1.7rem] text-slate-300">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="text-lg font-bold">{x.title}</h2>
          </div>
          <p className="mt-3 text-[15px] font-medium leading-relaxed text-slate-800">{x.lead}</p>
          {x.body.map((p, j) => (
            <p key={j} className="mt-3 text-sm leading-relaxed text-slate-600">{p}</p>
          ))}
          <div className="mt-5 space-y-4">
            {x.cases.map((c, j) => <Case key={j} c={c} />)}
          </div>
        </article>
      ))}

      <section className="card p-5">
        <h2 className="font-semibold">이 글의 근거</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
          수치는 전부 <code className="rounded bg-slate-100 px-1 text-[12px]">pipeline/</code> 의
          스크립트가 낸 값이며 화면은 계산하지 않습니다. 인용문은{" "}
          <code className="rounded bg-slate-100 px-1 text-[12px]">pipeline/findings.json</code> 에
          있고, 빌드할 때 해당 보고의 내러티브에 실제로 있는지 검사해 없으면 빌드가 멈춥니다.
          뚫린 방어와 발생 순서는 대조할 기관 코딩 필드가 없어 자동 채점되지 않으며 이중 주석으로
          검증합니다. {f.updated} 기준 기준표 {f.version}.
        </p>
      </section>
    </div>
  );
}
