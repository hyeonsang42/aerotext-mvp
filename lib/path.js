/**
 * 하위 경로 배포용 주소 보정.
 *
 * Next.js 의 basePath 는 next/link 와 next/image 에만 붙는다.
 * 이 프로젝트는 생 <a> 와 <img> 를 쓰므로 직접 붙여야 한다.
 * 안 붙이면 /aerotext-mvp/set/... 로 가야 할 링크가 /set/... 으로 가서 404 가 된다.
 *
 * 환경 변수가 없으면 빈 문자열이라 로컬 실행은 종전과 같다.
 */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** 사이트 내부 주소 앞에 basePath 를 붙인다. 인자는 항상 "/" 로 시작한다. */
export function url(path) {
  return `${BASE}${path}`;
}
