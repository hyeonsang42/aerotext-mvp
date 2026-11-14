import { getAll, getFacets, getBarriers, getCatch } from "@/lib/data";
import Explorer from "@/app/Explorer";

/* 뚫린 뒤 무엇이 받아냈는가.

   이 시스템이 기존 코딩 칸과 다른 유일한 축은 발생 순서다. 값을 가졌는지만 보면
   "예방이 뚫렸다" 와 "예방이 뚫린 뒤 탐지가 받아냈다" 를 구분할 수 없다.
   이 구역은 그 구분으로만 낼 수 있는 집계다. */
function Catch({ c }) {
  if (!c) return null;
  const max = Math.max(...c.prevention_by_layer.map((x) => x.n), 1);
  return (
    <section className="card p-5">
      <h2 className="text-base font-bold">뚫린 뒤 무엇이 받아냈는가</h2>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-600">
        앞단이 뚫려도 뒷단이 받아내서 준사고로 끝났다는 말을, 발생 순서를 써서 세어 본 것입니다.
        첫 뚫림보다 <b>뒤에</b> 작동한 방어만 셉니다. 발생 순서를 함께 기록하지 않으면 낼 수 없는 집계입니다.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          [`${c.breached_reports}건`, "뚫린 방어가 기록된 보고", `전체 ${c.reports}건 중`],
          [`${c.caught_rate}%`, "그 뒤에 받아낸 방어가 있음", `${c.caught}/${c.breached_reports}건`],
          [`${c.not_caught}건`, "그 뒤에 받아낸 방어가 없음", "원문에 이후 서술이 없는 경우 포함"],
        ].map(([num, k, sub]) => (
          <div key={k} className="rounded-md border hair px-3.5 py-3">
            <div className="stat text-2xl font-bold">{num}</div>
            <div className="mt-0.5 text-[13px] font-semibold text-slate-700">{k}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-slate-500">{sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-[13px] font-semibold text-slate-700">
          가장 앞 겹인 예방이 뚫렸을 때, 그 뒤에 무엇이 받아냈는가
        </h3>
        <p className="mt-1 text-[13px] text-slate-600">
          예방 층위가 뚫린 보고 {c.prevention_breached}건 가운데{" "}
          <b>{c.prevention_caught}건({c.prevention_caught_rate}%)</b> 에서 그 뒤에 다른 방어가 작동했습니다.
        </p>
        <ul className="mt-3 space-y-1.5 text-[13px]">
          {c.prevention_by_layer.map((x) => (
            <li key={x.layer} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-2">
              <span className="text-slate-700">{x.layer}</span>
              <span className="h-3 rounded-sm bg-white">
                <span className="bar block h-full rounded-sm bg-emerald-400"
                      style={{ width: `${(x.n / max) * 100}%` }} />
              </span>
              <span className="text-right tabular-nums text-slate-500">{x.n}건</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-700">
            같은 방어가 작동했다가 뚫린 보고 {c.flip_reports}건
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            앞에서는 제 일을 했는데 같은 보고 안에서 뒤에 뚫린 경우입니다.
            방어를 가졌는지 아닌지만 적으면 이 구분이 사라집니다.
          </p>
          <ul className="mt-2 space-y-1 text-[13px]">
            {c.flip_barriers.slice(0, 6).map((x) => (
              <li key={x.label_ko} className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-1">
                <span className="truncate text-slate-700">{x.label_ko}</span>
                <span className="shrink-0 tabular-nums text-slate-500">{x.n}건</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-slate-700">맨 처음 알아챈 쪽</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            시퀀스에서 가장 먼저 나오는 탐지 주체가 사람인지 장치인지로 나눈 것입니다.
          </p>
          <ul className="mt-2 space-y-1 text-[13px]">
            {c.first_detector.map((x) => (
              <li key={x.kind} className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-1">
                <span className="text-slate-700">{x.kind}</span>
                <span className="shrink-0 tabular-nums text-slate-500">{x.n}건</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        {c.note} 왼쪽 조건에서 <b>뚫린 뒤 받아낸 층위</b>, <b>작동했다가 뚫린 방어</b>,{" "}
        <b>맨 처음 알아챈 쪽</b> 으로 걸러 사례를 볼 수 있습니다.
      </p>
    </section>
  );
}


/** SCR-04 집계·조건 검색 */
export default function AnalysisPage() {
  const rows = getAll();
  const facets = getFacets();
  const b = getBarriers();
  const c = getCatch();
  const layers = Object.fromEntries(b.barriers.map((x) => [x.label_ko, x.layer]));

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-[1.35rem] font-bold">집계 · 조건 검색</h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          왼쪽에서 조건을 고르면 집계와 사례 목록이 함께 바뀝니다. 방어 이름이나 사례를 눌러
          원문까지 내려갈 수 있습니다. 뚫린 방어와 발생 순서는 대조할 코딩 필드가 없어 자동
          채점되지 않으며 이중 주석으로 검증합니다.
        </p>
      </section>
      <Catch c={c} />
      <Explorer rows={rows} facets={facets} layers={layers} />
    </div>
  );
}
