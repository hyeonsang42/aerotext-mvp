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
