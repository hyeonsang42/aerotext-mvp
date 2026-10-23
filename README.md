# AeroText (MVP 1차) 배포 저장소

항공 준사고 보고서 구조화 분석 시스템. 2026-2학기 항공빅데이터개론 바이브코딩 프로젝트.
김현상 (2025210508, 경상국립대학교 대학원 기술경영학과)

- **사이트: https://aerotext-mvp.vercel.app/** (Vercel)
- 사이트: https://hyeonsang42.github.io/aerotext-mvp/ (GitHub Pages)

## 이 저장소는 무엇인가

웹 화면의 **소스만** 담은 배포 전용 저장소다. 푸시하면 GitHub Actions 가 빌드해서 Pages 로 내보낸다.
빌드 결과물은 커밋하지 않는다.

소스의 원본과 문서, 전처리 파이프라인은 수업 저장소에 있다.
이 저장소의 내용은 거기서 `python 07_mvp/aerotext/deploy.py` 로 밀어 넣는다. 직접 고치지 않는다.

## 직접 돌려보려면

```
npm install
npm run dev        # http://localhost:3000
```

```
npm run build      # out/ 에 정적 HTML 생성
npx serve out
```

루트가 아닌 하위 경로에 올릴 때는 `NEXT_PUBLIC_BASE_PATH` 를 준다.
Pages 주소가 `/aerotext-mvp/` 로 시작하므로 배포 빌드는 이 값을 쓴다.

```
NEXT_PUBLIC_BASE_PATH=/aerotext-mvp npm run build
```

## 서버가 없다

정적 내보내기(`output: "export"`)라 결과가 HTML 과 JS 뿐이다.
데이터베이스도, 백엔드도, API 키도 없다. 화면은 `data/` 의 JSON 을 읽기만 한다.

원자료는 NASA ASRS Database Report Sets 이며, 제공 기관이 비식별 처리한 공개 자료다.
화면의 사진 3장은 NASA 공개 이미지(퍼블릭 도메인)이고 출처를 화면과 문서에 표기했다.
