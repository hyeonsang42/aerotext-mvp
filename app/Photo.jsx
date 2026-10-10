import { url } from "@/lib/path";
/**
 * 사진. 전부 NASA 공개 이미지이며 미국 정부 저작물이라 퍼블릭 도메인이다.
 * 출처와 촬영자를 화면에 표기하고 references/REFERENCES.md 에도 기록한다.
 * NASA 로고와 휘장은 사용하지 않는다 (NASA 미디어 이용지침).
 */

export const PHOTOS = {
  "hero-dc8": {
    src: "/img/hero-dc8.jpg",
    alt: "맑은 하늘을 배경으로 상승 중인 NASA DC-8 연구용 항공기",
    title: "NASA DC-8, 마지막 비행",
    credit: "NASA/Carla Thomas",
    id: "AFRC2024-0075-41",
    date: "2024-05-15",
  },
  "set-cabin": {
    src: "/img/set-cabin.jpg",
    alt: "좌석과 관측 장비가 놓인 NASA DC-8 객실 내부",
    title: "DC-8 객실 내부 (관측 비행 중)",
    credit: "NASA Ames Research Center",
    id: "ARC-2006-ACD06-0135-015",
    date: "2006-09-23",
  },
  "set-mechanic": {
    src: "/img/set-mechanic.jpg",
    alt: "격납고에서 항공기 동체 패널을 열고 작업 중인 정비사 네 명",
    title: "ER-2 정비 작업",
    credit: "NASA/Christopher LC Clark",
    id: "AFRC2026-0012-076",
    date: "2026-01-26",
  },
};

export const SET_PHOTO = { cabin_fumes: "set-cabin", mechanic: "set-mechanic" };

/** 사진 한 장. credit 을 끄면 caption 으로 따로 표기해야 한다. */
export function Photo({ name, className = "", imgClassName = "", credit = true }) {
  const p = PHOTOS[name];
  if (!p) return null;
  return (
    <figure className={`relative overflow-hidden ${className}`}>
      <img src={url(p.src)} alt={p.alt} className={`h-full w-full object-cover ${imgClassName}`} loading="lazy" />
      {credit && (
        <figcaption className="photo-credit absolute bottom-0 right-0 px-2 py-0.5 text-[10px] text-white mix-blend-luminosity">
          {p.credit}
        </figcaption>
      )}
    </figure>
  );
}

/** 사진 출처를 한 줄로 모아 보여준다 (문제정의서 15항). */
export function PhotoCredits() {
  return (
    <p className="text-xs leading-relaxed text-slate-500">
      사진: 미국 항공우주국(NASA) 공개 이미지. 미국 정부 저작물로 퍼블릭 도메인이며 출처 표기 후 사용.{" "}
      {Object.values(PHOTOS).map((p, i) => (
        <span key={p.id}>
          {i > 0 && " · "}
          {p.title} ({p.credit}, {p.id})
        </span>
      ))}
      . 도표와 아이콘은 직접 제작.
    </p>
  );
}
