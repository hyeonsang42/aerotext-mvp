import { url } from "@/lib/path";
import { getAllReportParams, getIndex, getReport } from "@/lib/data";
import ReportView from "@/app/ReportView";

export function generateStaticParams() {
  return getAllReportParams();
}

const CODED_LABEL = {
  "Detector.Person": "탐지 주체 (사람)",
  "Detector.Automation": "탐지 주체 (자동화)",
  "Result.General": "결과 (전반)",
  "Result.Flight Crew": "결과 (운항 승무원)",
  "Result.Air Traffic Control": "결과 (관제)",
  "When Detected": "탐지 시점",
  "Flight Phase": "발생 단계",
  "Make Model Name": "기종",
};

const CHECK_LABEL = {
  detector: "탐지 주체",
  response: "대응 행동",
  outcome: "결과 상태",
};

function Status({ value }) {
  const style =
    value === "일치"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
      : value === "불일치"
      ? "border-rose-300 bg-rose-50 text-rose-800"
      : "border-slate-300 bg-slate-50 text-slate-600";
  return <span className={`rounded border px-1.5 py-0.5 text-[11px] ${style}`}>{value}</span>;
}

/** SCR-03 보고서 상세 */
export default function ReportPage({ params }) {
  const report = getReport(params.set, params.acn);
  const rows = getIndex(params.set);
  const i = rows.findIndex((r) => r.acn === params.acn);
  const prev = i > 0 ? rows[i - 1] : null;
  const next = i < rows.length - 1 ? rows[i + 1] : null;

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-500">
        <a href={url("/")} className="hover:underline">세트 선택</a>
        <span className="mx-2">/</span>
        <a href={url(`/set/${params.set}/`)} className="hover:underline">{params.set}</a>
        <span className="mx-2">/</span>
        <span className="text-slate-900">ACN {report.acn}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="stat text-xl">ACN {report.acn}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-700">{report.synopsis}</p>
          <p className="mt-2 text-xs text-slate-500">
            {i + 1}번째 / {rows.length}건 · 기준표 {report.meta.rubric_version} · 프롬프트{" "}
            {report.meta.prompt_version} · {report.meta.model} · {report.meta.extracted_at} · 배치{" "}
            {report.meta.batch}
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          {prev ? (
            <a href={url(`/set/${params.set}/report/${prev.acn}/`)} className="rounded border border-slate-300 bg-white px-3 py-1.5 hover:border-slate-500">
              이전
            </a>
          ) : (
            <span className="rounded border border-slate-200 px-3 py-1.5 text-slate-300">이전</span>
          )}
          {next ? (
            <a href={url(`/set/${params.set}/report/${next.acn}/`)} className="rounded border border-slate-300 bg-white px-3 py-1.5 hover:border-slate-500">
              다음
            </a>
          ) : (
            <span className="rounded border border-slate-200 px-3 py-1.5 text-slate-300">다음</span>
          )}
        </div>
      </header>

      <ReportView report={report} />

      <section className="card p-5">
        <h2 className="font-semibold">기관 코딩 필드 대조</h2>
        <p className="mt-1 text-[13px] text-slate-600">
          탐지 주체만 자동 채점 대상입니다. 대응 행동과 결과 상태는 코딩 보유율이 낮아 참고 대조로만
          씁니다. 뚫린 방어와 발생 순서는 대조할 코딩 필드가 없어 이중 주석으로 검증합니다.
        </p>
        <table className="mt-4 w-full text-left text-[13px]">
          <thead className="border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="py-2 pr-4 font-medium">항목</th>
              <th className="py-2 pr-4 font-medium">기관 코딩</th>
              <th className="py-2 pr-4 font-medium">추출값</th>
              <th className="py-2 font-medium">결과</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(report.checks).map(([k, c]) => (
              <tr key={k} className="border-b hair last:border-0">
                <td className="py-2 pr-4 align-top">
                  <div className="font-medium">{CHECK_LABEL[k]}</div>
                  <div className="text-xs text-slate-400">{c.scoring}</div>
                </td>
                <td className="py-2 pr-4 align-top text-slate-700">{c.truth.join(", ") || "결측"}</td>
                <td className="py-2 pr-4 align-top text-slate-700">{c.predicted.join(", ") || "서술 없음"}</td>
                <td className="py-2 align-top"><Status value={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="mt-6 text-sm font-semibold">그 밖의 코딩 필드 (참고)</h3>
        <dl className="mt-2 grid gap-x-6 gap-y-1 text-[13px] sm:grid-cols-2">
          {Object.entries(report.coded).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="w-36 shrink-0 text-slate-400">{CODED_LABEL[k] || k}</dt>
              <dd className="text-slate-700">{v.join(", ") || "결측"}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
