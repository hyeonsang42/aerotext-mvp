import { getAll, getFacets, getBarriers } from "@/lib/data";
import Explorer from "@/app/Explorer";

/** SCR-04 집계·조건 검색 */
export default function AnalysisPage() {
  const rows = getAll();
  const facets = getFacets();
  const b = getBarriers();
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
      <Explorer rows={rows} facets={facets} layers={layers} />
    </div>
  );
}
