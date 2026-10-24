import { url } from "@/lib/path";
import { getScoring, getRules, getGeneralization } from "@/lib/data";
import { setKo, setListKo, asrsKo, asrsListKo } from "@/lib/labels";

/* 세트별 성적. 합산만 적으면 두 가지가 묻힌다.
   하나는 어떤 세트가 기준선과 같다는 것, 또 하나는 세트를 합치면
   세트마다 최빈값이 달라 단일값 기준선 자체가 내려간다는 것이다. */
function BySet({ s }) {
  if (!s.by_set) return null;
  const rows = Object.entries(s.by_set);
  const flat = rows.filter(([, v]) => v.gain <= 0);
  return (
    <section className="card p-5">
      <h2 className="font-semibold">세트별로 따로 재면</h2>
      <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-600">
        아래 합산 숫자만 보면 묻히는 것이 있어 세트마다 따로 적습니다.
        기준선은 그 세트 안에서 다시 계산한 값입니다.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-[13px]">
          <thead className="border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="py-2 pr-4 font-medium">세트</th>
              <th className="py-2 pr-4 text-right font-medium">채점</th>
              <th className="py-2 pr-4 text-right font-medium">읽고 뽑았을 때</th>
              <th className="py-2 pr-4 text-right font-medium">읽지 않고 찍었을 때</th>
              <th className="py-2 text-right font-medium">그 차이</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map(([name, v]) => (
              <tr key={name} className="border-b border-slate-100">
                <td className="py-2 pr-4">
                  {setKo(name)}
                  <span className="ml-2 text-[11px] text-slate-400">{asrsKo("detector", v.baseline_value)}</span>
                </td>
                <td className="py-2 pr-4 text-right">{v.scored}건</td>
                <td className="py-2 pr-4 text-right font-medium">{v.match_rate}%</td>
                <td className="py-2 pr-4 text-right text-slate-500">{v.baseline_rate}%</td>
                <td className={`py-2 text-right font-semibold ${v.gain > 0 ? "text-slate-800" : "text-rose-700"}`}>
                  {v.gain > 0 ? "+" : ""}{v.gain}%p
                </td>
              </tr>
            ))}
            <tr className="font-medium">
              <td className="py-2 pr-4">
                합산
                <span className="ml-2 text-[11px] text-slate-400">{asrsKo("detector", s.baseline_value)}</span>
              </td>
              <td className="py-2 pr-4 text-right">{s.scored}건</td>
              <td className="py-2 pr-4 text-right">{s.match_rate}%</td>
              <td className="py-2 pr-4 text-right text-slate-500">{s.baseline_rate}%</td>
              <td className="py-2 text-right">+{s.gain}%p</td>
            </tr>
          </tbody>
        </table>
      </div>
      {flat.length > 0 && (
        <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] leading-relaxed text-rose-900">
          <b>{flat.map(([k]) => setKo(k)).join(", ")}</b> 세트는 기준선과 차이가 없습니다.
          그 세트만 보면 신고서를 읽지 않고 제일 흔한 답만 찍는 것과 결과가 같다는 뜻입니다.
          여기서는 변별력이 없다고 적는 것이 맞습니다.
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        합산 기준선({s.baseline_rate}%)이 세트별 기준선보다 낮은 것은 성능이 아니라 셈법 때문입니다.
        세트마다 제일 흔한 답이 다르므로(연기는 운항 승무원, 정비는 정비사) 합치면
        한 값만 찍어서 맞출 수 있는 비율이 떨어집니다. 그래서 합산 차이는 실제보다 커 보입니다.
        세트별 숫자를 함께 봐야 합니다.
      </p>
    </section>
  );
}

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
  const g = getGeneralization();
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
          <b>기준선</b>이란, 내용을 읽지 않고 <b>제일 많이 나오는 답 하나만 전부 찍었을 때</b>의 정답률입니다.
          기준선 없이 일치율만 보면 그 숫자가 좋은지 나쁜지 알 수 없습니다. 그래서 늘 같이 적습니다.
          <b> 기준선은 채점 집합마다 다시 계산합니다.</b> 그래서 세트를 합친 기준선과
          세트별 기준선이 다르고, 아래 표를 세트별로 먼저 적었습니다.
        </div>
      </section>

      <BySet s={s} />

      <section className="card p-5">
        <h2 className="font-semibold">합산 (대화형 배치) <span className="font-normal text-[13px] text-slate-500">(현재 방식. 언어모델에게 기준표를 주고 한 묶음씩 읽히는 방법)</span></h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric strong label="일치율 (읽고 뽑았을 때)" value={`${s.match_rate}%`} sub={`${s.matched}/${s.scored}건 일치`} />
          <Metric label="기준선 (읽지 않고 찍었을 때)" value={`${s.baseline_rate}%`}
                  sub={`가장 흔한 답 하나(${asrsKo("detector", s.baseline_value)})만 전부 찍은 점수`} />
          <Metric strong label="그 차이" value={`+${s.gain}%p`} sub="읽어서 얻은 몫" />
          <Metric label="건당 평균 추출 개수" value={`${s.avg_predicted}개`} sub={`평균 정밀도 ${s.avg_precision}%`} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          {s.note} 필드 결측 {s.missing}건({s.missing_rate}%)은 채점에서 제외했습니다.
        </p>
      </section>

      {g && (
        <section className="card p-5">
          <h2 className="font-semibold">일반화 확인 (대화형 배치, 현재 방식)</h2>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-600">
            위 숫자는 시스템을 만들면서 함께 본 보고에서 나온 것입니다. 그래서 그 보고에만 잘 맞는 것은
            아닌지 확인해야 합니다. 그래서 {g.holdout.title.replace("검증용 ", "")} 세트는
            <b> 만드는 동안 한 번도 열어 보지 않고 남겨 두었습니다</b>. 다 만든 뒤에 그 자료로 다시 쟀습니다.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="만들 때 본 자료" value={`${g.dev.match_rate}%`}
                    sub={`${g.dev.scored}건 · 기준선 ${g.dev.baseline_rate}%`} />
            <Metric strong label="한 번도 안 열어 본 자료" value={`${g.holdout.match_rate}%`}
                    sub={`${g.holdout.scored}건 · 기준선 ${g.holdout.baseline_rate}%`} />
            <Metric strong label="떨어진 폭" value={`${g.drop}%p`}
                    sub={g.pass ? "목표 10%p 이내, 충족" : "목표 10%p 초과, 미충족"} />
            <Metric label="처음 보는 자료에서의 차이" value={`+${g.holdout.gain}%p`} sub="기준선 대비" />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            {g.note} 겹침 제외 {g.overlap_excluded}건.
            이 {g.drop}%p 하락이 지금 이 시스템에 대해 할 수 있는 가장 강한 말입니다.
            처음 보는 보고에서도 기준선보다 {g.holdout.gain}점 높게 나왔다는 뜻입니다.
          </p>
        </section>
      )}

      {dev && (
        <section className="card p-5">
          <h2 className="font-semibold">비교용 대조군: 단어 규칙만으로 뽑으면 어떻게 되는가</h2>
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
          <h2 className="font-semibold">대조군을 처음 보는 자료에서 재면 (규칙 기반)</h2>
          <p className="mt-1 max-w-3xl text-[13px] text-slate-600">
            규칙을 만들 때 쓰지 않은 검증용 세트({setListKo(r.holdout.sets)})에서 다시 잰 값입니다.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Metric label="개발용 세트" value={`${dev.match_rate}%`} sub={`기준선 ${dev.baseline_rate}%`} />
            <Metric label="검증용 세트" value={`${hold.match_rate}%`} sub={`기준선 ${hold.baseline_rate}%`} />
            <Metric label="하락폭" value={`${drop > 0 ? "-" : "+"}${Math.abs(drop)}%p`}
                    sub={Math.abs(drop) <= 10 ? "10%p 이내, 충족" : "10%p 초과, 미충족"} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-rose-800">
            검증용에서 일치율 {hold.match_rate}%는 그 집합의 기준선 {hold.baseline_rate}%보다
            {" "}{hold.baseline_rate - hold.match_rate}%p 낮습니다. 읽지 않고 찍는 것보다 못합니다.
            그래서 단어 규칙만으로는 안 된다고 결론 내렸고, 이것이 현재 방식을 쓰는 이유입니다.
            규칙을 정답에 맞춰 고쳐서 점수를 올리지 않았습니다. 대조군이므로 그대로 둡니다.
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
