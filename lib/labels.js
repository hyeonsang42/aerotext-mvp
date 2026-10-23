/**
 * ASRS 영어 코딩 값을 화면에 보일 한국어로 바꾼다.
 *
 * 기준표 화면에 적어 둔 원칙이 있다.
 *   "화면에는 한국어 라벨을 보이되 저장되는 값은 ASRS 원문 문자열입니다."
 * 저장과 채점은 ASRS 영어 값 그대로 하고, 보여 줄 때만 한국어로 바꾼다.
 * 번역표를 따로 만들지 않고 기준표(rubric.json)에 이미 있는 label_ko 를 쓴다.
 * 기준표가 바뀌면 화면도 같이 바뀐다.
 *
 * 파일을 읽으므로 서버(빌드) 쪽에서만 쓴다. 브라우저 화면은 lib/sets.js 를 쓴다.
 */

import { getRubric } from "@/lib/data";

export { SET_KO, setKo, setListKo } from "@/lib/sets";

const cache = {};

/**
 * 항목(detector, response, outcome)별로 따로 만든다.
 * 같은 영어 값이 항목에 따라 다른 뜻이 되기 때문이다.
 * 예: "Air Traffic Control" 은 사람 쪽에서는 관제사, 자동화 쪽에서는 관제 자동화 장비다.
 */
function buildMap(item) {
  if (cache[item]) return cache[item];
  const values = getRubric()?.items?.[item]?.values || [];
  const map = {};
  for (const v of values) {
    if (v.asrs_value && v.label_ko && !map[v.asrs_value]) {
      map[v.asrs_value] = v.label_ko;
    }
  }
  cache[item] = map;
  return map;
}

/** 못 찾은 값은 영어 그대로 남긴다. 조용히 사라지는 것보다 낫다 */
export function asrsKo(item, value) {
  if (!value) return value;
  return buildMap(item)[value] || value;
}

export function asrsListKo(item, values) {
  return (values || []).map((v) => asrsKo(item, v));
}
