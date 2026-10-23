import { url } from "@/lib/path";
import { getScoring, getRules } from "@/lib/data";
import { setKo, setListKo, asrsKo, asrsListKo } from "@/lib/labels";

function Metric({ label, value, sub, strong }) {
  return (
    <div className="rounded-md border hair px-3 py-2.5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-0.5 tabular-nums ${strong ? "text-2xl font-bold" : "text-lg font-semibold"}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

/** SCR-05 대조 채점 */
export default function ScoringPage() {
  const s = getScoring();
  const r = getRules();
  const dev = r?.dev?.combined;
  const hold = r?.holdout?.combined;
  const drop = dev && hold ? dev.match_rate - hold.match_rate : null;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-[1.35rem] font-bold">탐지 주체 대조 채점</h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          이 시스템이 뽑아낸 값이 맞는지 확인하는 화면입니다. 여섯 항목 중 <b>탐지 주체</b>,
          곧 누가 먼저 알아챘는가는 기관이 이미 답을 적어 두었습니다. 그 답과 맞춰 봅니다.
          채점 단위는 {s.unit}입니다. 사람이냐 기계냐로만 나누면 제일 흔한 답만 찍어도 97%가 나와
          변별력이 없으므로, 세부 값까지 맞아야 정답으로 칩니다.
        </p>
        {/* 기준선을 모르면 일치율 숫자가 좋은지 나쁜지 알 수 없다. 먼저 푼다 */}
        <div className="mt-3 max-w-3xl rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
          <b>최빈값 기준선</b>이란, 내용을 읽지 않고 <b>제일 많이 나오는 답 하나만 전부 찍었을 때</b>의 정답률입니다.
          일치율이 이 숫자보다 충분히 높아야 의미가 있습니다. 그래서 두 숫자를 늘 같이 적습니다.
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">대화형 배치 <span className="font-normal text-[13px] text-slate-500">(현재 방식. 언어모델에게 기준표를 주고 한 묶음씩 읽히는 방법)</span></h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric strong label="세부 값 일치율" value={`${s.match_rate}%`} sub={`${s.matched}/${s.scored}건`} />
          <Metric label="최빈값 기준선" value={`${s.baseline_rate}%`} sub={asrsKo("detector", s.baseline_value)} />
          <Metric strong label="기준선 대비" value={`+${s.gain}%p`} sub="상승폭" />
          <Metric label="건당 평균 추출 개수" value={`${s.avg_predicted}개`} sub={`평균 정밀도 ${s.avg_precision}%`} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          {s.note} 필드 결측 {s.missing}건({s.missing_rate}%)은 채점에서 제외했습니다.
        </p>
      </section>

      {dev && (
        <section className="card p-5">
          <h2 className="font-semibold">추출 방식 비교</h2>
          <p className="mt-1 text-[13px] text-slate-600">
            같은 세트, 같은 결측 제외 규칙, 같은 지표로 비교합니다.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-[13px]">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">추출 방식</th>
                  <th className="py-2 pr-4 text-right font-medium">일치율</th>
                  <th className="py-2 pr-4 text-right font-medium">최빈값 기준선</th>
                  <th className="py-2 pr-4 text-right font-medium">기준선 대비</th>
                  <th className="py-2 text-right font-medium">건당 추출</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                <tr className="border-b border-slate-100">
                  <td className="py-2 pr-4">규칙 기반 <span className="text-slate-500">(정해둔 단어 규칙으로만 뽑기)</span></td>
                  <td className="py-2 pr-4 text-right">{dev.match_rate}%</td>
                  <td className="py-2 pr-4 text-right text-slate-500">{dev.baseline_rate}%</td>
                  <td className={`py-2 pr-4 text-right ${dev.gain > 0 ? "text-slate-700" : "text-rose-700"}`}>
                    {dev.gain > 0 ? "+" : ""}{dev.gain}%p
                  </td>
                  <td className="py-2 text-right">{dev.avg_predicted}개</td>
                </tr>
                <tr className="border-b border-slate-100 font-medium">
                  <td className="py-2 pr-4">대화형 배치</td>
                  <td className="py-2 pr-4 text-right">{s.match_rate}%</td>
                  <td className="py-2 pr-4 text-right text-slate-500">{s.baseline_rate}%</td>
                  <td className="py-2 pr-4 text-right">+{s.gain}%p</td>
                  <td className="py-2 text-right">{s.avg_predicted}개</td>
                </tr>
                <tr className="text-blue-700">
                  <td className="py-2 pr-4">차이</td>
                  <td className="py-2 pr-4 text-right">+{s.match_rate - dev.match_rate}%p</td>
                  <td className="py-2 pr-4" />
                  <td className="py-2 pr-4 text-right">+{s.gain - dev.gain}%p</td>
                  <td className="py-2 text-right">+{(s.avg_predicted - dev.avg_predicted).toFixed(2)}개</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            규칙 기반은 {dev.empty}건에서 아무것도 뽑지 못했고 그 건은 전부 불일치로 잡힙니다.
            값을 낸 {dev.answered}건만 보면 {dev.answered_rate}%입니다. 규칙을 정답에 맞춰 고치지 않았습니다.
          </p>
        </section>
      )}

      {hold && (
        <section className="card p-5">
          <h2 className="font-semibold">일반화 확인 (규칙 기반)</h2>
          <p className="mt-1 text-[13px] text-slate-600">
            규칙 개발에 쓰지 않은 검증용 세트({setListKo(r.holdout.sets)})에서 다시 잰 값입니다.
            목표는 개발 세트 대비 10%p 이내 하락입니다.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Metric label="개발용 세트" value={`${dev.match_rate}%`} sub={`기준선 ${dev.baseline_rate}%`} />
            <Metric label="검증용 세트" value={`${hold.match_rate}%`} sub={`기준선 ${hold.baseline_rate}%`} />
            <Metric label="하락폭" value={`${drop > 0 ? "-" : "+"}${Math.abs(drop)}%p`}
                    sub={Math.abs(drop) <= 10 ? "10%p 이내, 충족" : "10%p 초과, 미충족"} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-rose-800">
            검증용에서 일치율 {hold.match_rate}%는 그 집합의 최빈값 기준선 {hold.baseline_rate}%보다
            {" "}{hold.baseline_rate - hold.match_rate}%p 낮습니다. 최빈값만 답하는 것보다 못하므로
            규칙 기반은 일반화 이전에 변별력이 없습니다. 대화형 배치의 일반화 확인은 진행 중입니다.
          </p>
        </section>
      )}

      <section className="overflow-hidden card">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">불일치 {s.mismatches.length}건</h2>
          <p className="mt-1 text-[13px] text-slate-600">
            접수번호를 누르면 해당 보고의 원문과 근거 구절로 이동합니다.
          </p>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead className="thead border-b border-slate-900/10 text-xs">
            <tr>
              <th className="px-5 py-2 font-medium">접수번호</th>
              <th className="px-5 py-2 font-medium">기관 코딩</th>
              <th className="px-5 py-2 font-medium">추출값</th>
            </tr>
          </thead>
          <tbody>
            {s.mismatches.map((m) => (
              <tr key={`${m.set}-${m.acn}`} className="border-b hair last:border-0 hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-2.5 align-top">
                  <a href={url(`/set/${m.set}/report/${m.acn}/`)} className="quiet font-medium text-[var(--accent)] underline decoration-1 hover:text-cyan-800">{m.acn}</a>
                  <div className="text-[11px] text-slate-400">{setKo(m.set)}</div>
                </td>
                <td className="px-5 py-2.5 align-top text-slate-700">{asrsListKo("detector", m.truth).join(", ")}</td>
                <td className="px-5 py-2.5 align-top text-slate-700">
                  {asrsListKo("detector", m.predicted).join(", ") || <span className="text-slate-400">서술 없음 (추출 안 함)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
