import { url } from "@/lib/path";
import { setKo } from "@/lib/sets";
import { getSets, getIndex } from "@/lib/data";
import { SetIcon } from "@/app/Art";
import { Photo, SET_PHOTO } from "@/app/Photo";

export function generateStaticParams() {
  return getSets().map((s) => ({ set: s.set }));
}

/** 보고서 목록 */
export default function SetPage({ params }) {
  const meta = getSets().find((s) => s.set === params.set);
  const rows = getIndex(params.set);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-500">
        <a href={url("/")} className="hover:underline">세트 선택</a>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{setKo(meta.set)}</span>
      </nav>

      <Photo name={SET_PHOTO[meta.set]} className="h-40 rounded-lg border border-slate-200 sm:h-48" />

      <section className="flex items-start gap-4">
        <SetIcon set={meta.set} className="mt-1 h-8 w-8 shrink-0 text-slate-400" />
        <div>
        <h1 className="text-[1.35rem] font-bold">{setKo(meta.set)}</h1>
        <p className="mt-1 text-sm text-slate-600">
          보고 {meta.records}건 · 추출 항목 {meta.items}개 · 기준표 {meta.rubric_version} ·
          프롬프트 {meta.prompt_version} · {meta.extracted_at}
        </p>
        </div>
      </section>

      <section className="overflow-x-auto card">
        <table className="w-full text-left text-[13px]">
          <thead className="thead border-b border-slate-900/10 text-xs">
            <tr>
              <th className="px-4 py-2 font-medium">접수번호</th>
              <th className="px-4 py-2 font-medium">요약</th>
              <th className="px-4 py-2 font-medium">위협</th>
              <th className="px-4 py-2 font-medium">탐지 주체</th>
              <th className="px-4 py-2 text-center font-medium">방어</th>
              <th className="px-4 py-2 text-center font-medium">대조</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.acn} className="border-b hair last:border-0 hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 align-top">
                  <a
                    href={url(`/set/${params.set}/report/${r.acn}/`)}
                    className="quiet font-medium text-[var(--accent)] underline decoration-1 hover:text-cyan-800"
                  >
                    {r.acn}
                  </a>
                </td>
                <td className="max-w-md px-4 py-3 align-top text-slate-700">{r.synopsis}</td>
                <td className="px-4 py-3 align-top text-slate-600">{r.threats.join(", ") || "서술 없음"}</td>
                <td className="px-4 py-3 align-top text-slate-600">{r.detectors.join(", ") || "서술 없음"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-center align-top tabular-nums">
                  <span className="text-slate-700">{r.n_worked}</span>
                  <span className="mx-1 text-slate-300">/</span>
                  <span className={r.n_breached ? "font-semibold text-rose-700" : "text-slate-400"}>
                    {r.n_breached}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center align-top">
                  <Status value={r.detector_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="text-xs leading-relaxed text-slate-500">
        방어 칸은 작동한 방어 / 뚫린 방어의 개수입니다. 대조 칸은 추출한 탐지 주체와 기관 코딩
        Detector 필드의 비교 결과이며, 뚫린 방어와 발생 순서는 대조할 코딩 필드가 없어 자동 채점되지
        않습니다.
      </p>
    </div>
  );
}

export function Status({ value }) {
  const style =
    value === "일치"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
      : value === "불일치"
      ? "border-rose-300 bg-rose-50 text-rose-800"
      : "border-slate-300 bg-slate-50 text-slate-600";
  return (
    <span className={`inline-block rounded border px-1.5 py-0.5 text-[11px] ${style}`}>{value}</span>
  );
}
