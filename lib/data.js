/**
 * 정적 데이터 읽기. 빌드 시점에만 실행된다.
 * 화면은 계산하지 않는다. 숫자는 pipeline/10_build_web.py 가 만든 값을 그대로 쓴다.
 */
import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "data");

function read(...parts) {
  return JSON.parse(fs.readFileSync(path.join(DATA, ...parts), "utf-8"));
}

export const getSets = () => read("sets.json");
export const getScoring = () => read("scoring.json");
export const getBarriers = () => read("barriers.json");
export const getAll = () => read("all.json");
export const getFacets = () => read("facets.json");
export const getRules = () => read("rules.json");
export const getFindings = () => read("findings.json");
export const getRubric = () => read("rubric.json");
/** 근거 구절의 한국어 옮김. 아직 없는 구절이 많아 실패해도 넘어간다 */
export const getEvidenceKo = () => {
  try { return read("evidence_ko.json"); } catch { return {}; }
};
/** 기관 코딩 칸의 조합 겹침. 아직 측정하지 않았을 수 있어 실패해도 넘어간다 */
export const getCodingOverlap = () => {
  try { return read("coding_overlap.json"); } catch { return null; }
};
/** 위 예시 보고의 우리말 옮김 */
export const getCodingOverlapKo = () => {
  try { return read("coding_overlap_ko.json"); } catch { return {}; }
};
export const getGeneralization = () => {
  try { return read("generalization.json"); } catch { return null; }
};
export const getIndex = (set) => read(set, "index.json");
export const getReport = (set, acn) => read(set, "reports", `${acn}.json`);

export function getAllReportParams() {
  return getSets().flatMap((s) =>
    getIndex(s.set).map((r) => ({ set: s.set, acn: r.acn }))
  );
}
