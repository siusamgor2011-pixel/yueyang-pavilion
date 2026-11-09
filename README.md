# 岳陽樓記 · 洞庭三境

Three.js 互動教學網站：第一人稱步行探索、春日／陰雨／月夜三境、附近景物提示、遷客騷人對話、場景解謎及課文問答。

## 操作

WASD／方向鍵步行，拖曳轉頭；觸控裝置使用畫面方向鍵。走近景物才會顯示標籤。學習進度保存在本機瀏覽器。

## 發佈

GitHub Settings → Pages → Deploy from a branch，選 main 分支及 / (root)，儲存即可自動發佈。後續提交會自動更新。

index.html、JavaScript、CSS、Three.js 模組和 GLB 模型須一起保留。使用相對路徑，支援 GitHub Pages 專案子路徑。

## 本機預覽

執行 `python3 -m http.server 8000`，瀏覽 http://localhost:8000 。請勿直接雙擊 HTML；JavaScript 模組需要 HTTP 伺服器。

## 說明

建築採現存岳陽樓的可辨識形制，按課文作藝術重構，並非北宋原樓的考古復原。人物為虛構教學角色；人物及動物造型仍屬初版。GLB 下載包含樓體及材質，天候動畫在網頁運作。

需要支援 WebGL 的瀏覽器；尚未在 iPad 實機完成驗證。Google Fonts 無法連線時會使用系統字體。

Three.js MIT 授權見 LICENSE-THREE.txt。

## 獨立模型室

開啟 [models.html](./models.html)，切換老虎與遷客，拖曳旋轉、縮放，檢查正側背面、臉與手／足掌。支援自動旋轉、網格檢視及 GLB 下載。此頁是尚待雕塑提升的可互動初版，未整合到主遊戲。製作與授權見 [MODEL_NOTES.md](./MODEL_NOTES.md)，實測結果見 [TEST_RESULTS.md](./TEST_RESULTS.md)。
