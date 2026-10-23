/**
 * 세트 이름을 한국어로.
 *
 * 이 파일은 파일 읽기를 하지 않는다. 브라우저에서 도는 화면(Explorer 등)도
 * 그대로 가져다 쓸 수 있어야 하기 때문이다.
 * ASRS Report Sets 의 주제를 한국어로 옮긴 것이고, 원래 키는 주소에 그대로 남는다.
 */

export const SET_KO = {
  cabin_fumes: "객실 연기·냄새",
  mechanic: "정비 작업",
  flt_attendant: "객실 승무원",
  rwy_incur: "활주로 침범",
  crm: "승무원 협업",
};

export function setKo(set) {
  return SET_KO[set] || set;
}

/** 여러 세트를 한 줄로. "객실 승무원, 활주로 침범" */
export function setListKo(sets) {
  return (sets || []).map(setKo).join(", ");
}
