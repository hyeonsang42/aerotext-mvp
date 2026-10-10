/** 정적 내보내기. 서버도 API 키도 없다. out/ 폴더만 올리면 동작한다.
 *
 *  루트가 아닌 하위 경로에 올릴 때는 basePath 가 필요하다.
 *  GitHub Pages 처럼 주소가 /저장소이름/ 으로 시작하면 자산 경로가 어긋나기 때문이다.
 *  환경 변수로 받아서, 로컬에서는 아무것도 지정하지 않고 루트로 쓴다.
 *
 *    로컬:        npm run build
 *    Pages 배포:  NEXT_PUBLIC_BASE_PATH=/aerotext-mvp npm run build
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
};
export default nextConfig;
