import { getRubric, getBarriers, getFacets } from "@/lib/data";

export const metadata = { title: "방어 기준표 — AeroText" };

const LAYER_DOT = {
  예방: "bg-amber-400", 탐지: "bg-blue-400", 해소: "bg-indigo-400", 복구: "bg-emerald-400",
};

const SCORING_STYLE = {
  "자동 채점": "border-emerald-300 bg-emerald-50 text-emerald-800",
  "참고 대조": "border-sky-300 bg-sky-50 text-sky-800",
  "이중 주석": "border-amber-300 bg-amber-50 text-amber-900",
  "대조 없음": "border-slate-300 bg-slate-50 text-slate-600",
};

export default function RubricPage() {
  const r = getRubric();
  const b = getBarriers();
  const used = Object.fromEntries(b.barriers.map((x) => [x.label_ko, x]));
  const total = Object.values(r.items).reduce((a, i) => a + i.values.length, 0);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-[1.35rem] font-bold">방어 기준표 {r.version}</h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          추출은 이 값 목록 안에서만 이루어집니다. 목록에 없는 값은 만들지 않고 서술이 없으면
          비워 둡니다. 값 {total}개. 기준표는 코드 밖 파일이며 고칠 때는 덮어쓰지 않고 새 버전을
          만듭니다.
        </p>
        <ul className="mt-3 space-y-1 text-[13px] text-slate-600">
          {r.note.map((n, i) => <li key={i}>· {n}</li>)}
        </ul>
      </section>

      {Object.entries(r.items).map(([key, item]) => (
        <section key={key} className="card p-5">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="font-semibold">{item.label_ko}</h2>
            <span className={`rounded border px-1.5 py-0.5 text-[11px] ${SCORING_STYLE[item.scoring]}`}>
              {item.scoring}
            </span>
            <span className="text-[13px] text-slate-400">값 {item.values.length}개</span>
            {item.coded_fields && (
              <span className="text-[12px] text-slate-400">
                대조 필드 {item.coded_fields.join(", ")}
              </span>
            )}
          </div>
          {item.note && <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{item.note}</p>}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-[13px]">
              <thead className="thead border-b border-slate-900/10 text-xs">
                <tr>
                  <th className="py-2 pr-4 font-medium">값</th>
                  <th className="py-2 pr-4 font-medium">뜻</th>
                  {key === "barrier" && <th className="py-2 pr-4 text-right font-medium">작동/뚫림</th>}
                  {item.values[0].observed !== undefined && (
                    <th className="py-2 text-right font-medium">표본 150건</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {item.values.map((v) => {
                  const u = used[v.label_ko];
                  return (
                    <tr key={v.code} className="border-b hair last:border-0 align-top">
                      <td className="py-2 pr-4">
                        <div className="font-medium text-slate-800">
                          {v.layer && (
                            <span className={`mr-1.5 inline-block h-2 w-2 rounded-full align-middle ${LAYER_DOT[v.layer]}`} />
                          )}
                          {v.label_ko}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {v.layer ? `${v.layer} · ${v.agent}` : v.code}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-slate-600">
                        {v.desc || <span className="text-slate-400">ASRS 코딩 값 그대로</span>}
                        {v.asrs_value && (
                          <div className="mt-0.5 text-[11px] text-slate-400">ASRS {v.asrs_value}</div>
                        )}
                      </td>
                      {key === "barrier" && (
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {u ? (
                            <>
                              <span className="text-emerald-700">{u.worked}</span>
                              <span className="mx-0.5 text-slate-300">/</span>
                              <span className={u.breached ? "font-semibold text-rose-700" : "text-slate-400"}>
                                {u.breached}
                              </span>
                            </>
                          ) : <span className="text-slate-300">사용 없음</span>}
                        </td>
                      )}
                      {v.observed !== undefined && (
                        <td className="py-2 text-right tabular-nums text-slate-500">{v.observed}건</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-500">출처: {item.source}</p>
        </section>
      ))}

      <section className="card p-5">
        <h2 className="font-semibold">왜 ASRS 값을 번역하지 않았는가</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
          탐지 주체, 대응 행동, 결과 상태의 값은 기관 코딩 값과 글자 그대로 같습니다. 매핑표를
          두면 매핑에 없는 값이 채점에서 빠지고 표본이 줄어듭니다. 이전 방향에서 계통 62개 값을
          존 10개로 묶었다가 검증용 세트의 채점 대상이 17건으로 줄어 판단을 보류한 일이 있어,
          채점과 대조가 걸린 항목은 매핑표를 아예 만들지 않았습니다. 화면에는 한국어 라벨을
          보이되 저장되는 값은 ASRS 원문 문자열입니다.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
          반대로 위협과 방어는 ASRS에 대응 필드가 없습니다. 이 프로젝트가 새로 만드는 부분이고,
          그래서 자동 채점되지 않으며 이중 주석으로 검증합니다.
        </p>
      </section>
    </div>
  );
}
