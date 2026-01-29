# Claude Code Project Instructions

## Auto Commit & Push (필수)
모든 작업 완료 후 반드시:
1. `git add` - 변경된 파일 스테이징
2. `git commit` - 한국어로 적절한 커밋 메시지 작성
3. `git push` - 원격 저장소에 푸시

이 과정을 매 작업 완료 시 자동으로 수행할 것. 사용자가 요청하지 않아도 항상 실행.

---

## 3D City GLB 생성/압축/업로드 가이드

### 구조 설명
- **GLB 파일**: 정적 지오메트리 (건물, 도로, 나무, 가로등 등)
- **동적 생성**: 캔버스 텍스처를 사용하는 텍스트 (상점 간판, 자판기, 공중전화)
- 텍스트는 GLB에 포함되지 않고 로드 후 `addShopSignTexts()`, `addFurnitureTexts()`로 추가됨

### 1. GLB 내보내기 준비
```javascript
// city-main.js에서 USE_GLB = false 확인
const USE_GLB = false;
```

### 2. GLB 내보내기
1. 브라우저에서 사이트 열기
2. 개발자 콘솔(F12)에서 실행:
```javascript
exportSceneToGLB()
```
3. `city.glb` 파일이 다운로드 폴더에 저장됨

### 3. meshopt 압축
```bash
cd /c/Users/taro1/Downloads
npx gltf-transform optimize city.glb city-opt.glb --compress meshopt
```
- 일반적으로 60~70% 크기 감소

### 4. R2 업로드
```bash
npx wrangler r2 object put hada0127/city.glb --file=city-opt.glb --content-type="model/gltf-binary" --remote
```
- 버킷 이름: `hada0127`
- R2 URL: `https://pub-0c79382ed5a947839fede2eac510554d.r2.dev/city.glb`

### 5. USE_GLB 활성화
```javascript
// city-main.js에서 변경
const USE_GLB = true;
```

### 6. 커밋 & 푸시
```bash
git add resource/js/city/city-main.js
git commit -m "USE_GLB = true 활성화"
git push
```

### 관련 함수
| 함수 | 설명 |
|------|------|
| `createShoppingDistrictBase()` | 상점 건물 (텍스트 없이) - GLB용 |
| `createAllFurnitureBase()` | 가구류 (텍스트 없이) - GLB용 |
| `addShopSignTexts()` | 상점 간판 텍스트 추가 |
| `addFurnitureTexts()` | 자판기/공중전화 텍스트 추가 |
| `exportSceneToGLB()` | GLB 내보내기 (콘솔에서 호출) |
