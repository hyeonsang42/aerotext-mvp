import { url } from "@/lib/path";
import { getSets, getScoring, getBarriers } from "@/lib/data";
import { DefenseLayers, SetIcon, BarrierBars } from "@/app/Art";
import { Photo, PhotoCredits, SET_PHOTO } from "@/app/Photo";

/* 첫 화면에서 보고서 한 건으로 바로 가는 링크.
   세트 -> 목록 -> 스크롤 -> 클릭 네 단계를 거치지 않고 이 시스템이 무엇을 보여주는지 바로 확인하게 한다.
   같은 방어(절차·체크리스트 준수)가 작동과 뚫림 양쪽에 나오는 보고라 시퀀스를 설명하기에 가장 좋다. */
const LEAD = { set: "cabin_fumes", acn: "2084653" };

/** SCR-01 세트 선택 */
export default function Home() {
  const sets = getSets();
  const s = getScoring();
  const b = getBarriers();
  const total = sets.reduce((a, x) => a + x.records, 0);
  const items = sets.reduce((a, x) => a + x.items, 0);

  return (
    <div className="space-y-10">
      <section className="overflow-hidden card">
        <div className="relative h-56 sm:h-64">
          <Photo name="hero-dc8" className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/45 to-slate-900/10" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
            <h1 className="text-xl font-bold text-white drop-shadow sm:text-2xl">
              준사고는 왜 사고가 되지 않았는가
            </h1>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-white/85">
              보고 {total}건의 내러티브에서 방어 시퀀스를 복원하고, 작동한 방어와 뚫린 방어를 구분해 집계했습니다.
            </p>
          </div>
        </div>
        {/* 핵심 결론 세 가지. 발표 화면에서 뒷자리까지 읽히도록 크게 둔다. 전부 측정값이다. */}
        <div className="grid gap-px bg-white/10 sm:grid-cols-3" style={{ backgroundColor: "var(--ink-900)" }}>
          {[
            {
              n: `${b.layers[0].breach_rate}%`,
              k: "예방 층위 뚫림",
              d: `뚫린 방어 ${b.breached_total}건 중 ${b.layers[0].breached}건. 가장 앞단이 가장 자주 뚫린다`,
            },
            {
              n: `${s.match_rate}%`,
              k: "탐지 주체 대조 일치율",
              d: `최빈값 기준선 ${s.baseline_rate}% 대비 +${s.gain}%p. 기준선 없이 쓰지 않는다`,
            },
            {
              n: `${items}개`,
              k: "근거 원문 연결",
              d: "누락 0개. 원문에 없는 구절은 화면에 올라오지 못한다",
            },
          ].map((x) => (
            <div key={x.k} className="px-6 py-5" style={{ backgroundColor: "var(--ink-900)" }}>
              <div className="stat text-[2.5rem] font-bold leading-none text-white">{x.n}</div>
              <div className="mt-2 text-[15px] font-semibold text-white/90">{x.k}</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">{x.d}</p>
            </div>
          ))}
        </div>

        <div className="border-b border-slate-100 px-6 pt-5">
          <h2 className="text-base font-bold">방어 층위별로 어디가 뚫리는가</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
            아래 그림의 구멍 크기는 실제 측정한 뚫림 비율에 비례합니다.
          </p>
        </div>
        <div className="px-4 pb-4 pt-2 sm:px-6">
          <DefenseLayers layers={b.layers} />
        </div>
        <p className="border-t border-slate-100 px-6 py-3 text-xs leading-relaxed text-slate-500">
          앞단인 예방이 가장 많이 뚫리고({b.layers[0].breach_rate}%), 알아챈 뒤의 해소·복구는 거의
          뚫리지 않습니다. {b.reports}건 중 {b.breached_reports}건에 뚫린 방어가 기록돼 있습니다.
          기관 코딩 필드에는 이 구분이 없습니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold">처리된 세트</h2>
        <p className="mt-1 text-sm text-slate-600">
          세트를 고르면 보고서 목록과 보고서별 방어 시퀀스를 볼 수 있습니다. 현재 {sets.length}개 세트{" "}
          {total}건, 추출 항목 {items}개.
        </p>
        <a href={url(`/set/${LEAD.set}/report/${LEAD.acn}/`)}
           className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-5 py-3.5 transition hover:border-[var(--accent)]/60">
          <span className="text-[15px] font-semibold text-[var(--accent)]">보고서 한 건 바로 보기</span>
          <span className="text-sm text-slate-600">
            ACN {LEAD.acn} · 화장실 연기 경고 후 예방적 탈출. 같은 방어가 작동과 뚫림 양쪽에 나옵니다
          </span>
        </a>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {sets.map((x) => (
            <a key={x.set} href={url(`/set/${x.set}/`)}
               className="group block overflow-hidden card p-5 transition hover:border-slate-400 hover:shadow-sm">
              <Photo name={SET_PHOTO[x.set]} className="-mx-5 -mt-5 mb-4 h-32 rounded-t-lg" />
              <div className="flex items-start gap-4">
                <SetIcon set={x.set} className="mt-0.5 h-9 w-9 shrink-0 text-slate-400 transition group-hover:text-slate-700" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold">{x.set}</h3>
                    <span className="shrink-0 text-sm text-slate-500 tabular-nums">{x.records}건</span>
                  </div>
                  <dl className="mt-2.5 space-y-1 text-[13px] text-slate-600">
                    <div className="flex gap-2"><dt className="w-28 shrink-0 text-slate-400">추출 항목</dt><dd className="tabular-nums">{x.items}개</dd></div>
                    <div className="flex gap-2"><dt className="w-28 shrink-0 text-slate-400">뚫린 방어 기록</dt><dd className="tabular-nums">{x.breached_reports}건</dd></div>
                    <div className="flex gap-2"><dt className="w-28 shrink-0 text-slate-400">추출 설정</dt><dd>기준표 {x.rubric_version} · 프롬프트 {x.prompt_version}</dd></div>
                    <div className="flex gap-2"><dt className="w-28 shrink-0 text-slate-400">처리일</dt><dd>{x.extracted_at}</dd></div>
                  </dl>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="card p-5">
          <h2 className="font-semibold">방어별 작동과 뚫림</h2>
          <p className="mt-1 text-[13px] text-slate-600">
            초록은 작동한 방어, 빨강은 뚫린 방어입니다. 뚫림 비율이 높은 순서로 놓았습니다.
          </p>
          <div className="mt-4"><BarrierBars barriers={b.barriers} /></div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">{b.note}</p>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold">탐지 주체 대조 채점</h2>
            <p className="mt-1 text-[13px] text-slate-600">채점 단위는 {s.unit}.</p>
            <div className="mt-4 space-y-2">
              {[
                ["세부 값 일치율", `${s.match_rate}%`, `${s.matched}/${s.scored}건`],
                ["최빈값 기준선", `${s.baseline_rate}%`, s.baseline_value],
                ["기준선 대비", `+${s.gain}%p`, "상승폭"],
                ["건당 평균 추출", `${s.avg_predicted}개`, `정밀도 ${s.avg_precision}%`],
              ].map(([k, v, sub]) => (
                <div key={k} className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
                  <span className="text-sm font-medium text-slate-600">{k}</span>
                  <span className="text-right">
                    <span className="stat text-2xl font-bold text-[var(--ink-800)]">{v}</span>
                    <span className="ml-2 text-[13px] text-slate-500">{sub}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {s.note} 결측 {s.missing}건({s.missing_rate}%)은 제외했습니다. 불일치 {s.mismatches.length}건.
            </p>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold">위협 분포</h2>
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {b.threats.map((t) => (
                <li key={t.label_ko} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-2">
                  <span className="truncate text-slate-700">{t.label_ko}</span>
                  <span className="h-3 rounded-sm bg-slate-100">
                    <span className="bar block h-full rounded-sm bg-slate-400" style={{ width: `${(t.count / b.threats[0].count) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-slate-500">{t.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-5">
        <PhotoCredits />
      </section>
    </div>
  );
}
