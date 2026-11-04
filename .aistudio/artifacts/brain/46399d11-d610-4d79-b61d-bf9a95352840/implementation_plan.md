# 主画布图片资源纯色几何形状即时占位替换方案 (Hero Artboard Solid Geometric Placeholders Plan)

根据您的确认要求，本方案专为主画布（Hero Artboard）中的核心视觉图层（包含相框、人物剪影肖像、撕纸底纸等）实现**轻量、即时呈现的纯色几何形状占位系统**。在图片尚未完全加载或网络延迟时，页面将立即以几何纯色形状渲染出完整的构图骨架，避免空白或视觉断层，并在图片完全就绪后平滑融合。

---

### User Review & Critical Decisions

> [!IMPORTANT]
> 针对您的明确选择：
> - **应用范围**：聚焦于主画布核心区域（Hero Artboard），涵盖撕纸底纸（Torn Paper）、拍立得相框（Frame）与人物肖像（Portrait Bottom & Top）。
> - **呈现风格**：采用**极简纯色几何轮廓（Simplified solid geometric outlines）**即时绘制，零延迟渲染，还原构图重心。
> - **加载状态**：纯色几何形状在图片尚未加载完成时立即可见，并作为持久底衬，图片加载成功后平滑融入；若网络受阻或图片加载失败，纯色形状将作为优雅的降级底色稳定展示。

- **已确认决策 1（主画布聚焦）**：仅处理相框、肖像、撕纸三大高视觉权重的主画布资源，侧栏图标及普通小组件保持原有精简样式，避免过度设计。
- **已确认决策 2（几何纯色轮廓设计）**：
  - **撕纸底纸 (Torn Paper)**：以暖灰色/牛皮纸本色（`#ded9cd` / `#e2ddd1`）纯色几何条块直接定位在倾斜主轴，勾勒出撕纸的倾斜角度与区域。
  - **外相框 (Polaroid Frame)**：以深深木炭色/黑灰边框（`#1e1c1b`）配合米白感光区（`#f4f1ea`）的纯色双层几何矩形即时勾勒出经典相框结构。
  - **人物肖像 (Portrait Silhouette)**：以极简深色几何剪影（`#2a2826` / `#363332`）即时支撑主体人物位置与头部层次，保持画面重心稳定。
- **已确认决策 3（平滑无缝加载）**：纯色几何层作为 SVG/DOM 底层几何体直接静态绘制，上层 `<image>` 在 `onLoad` 前保持透明，加载完成后通过 CSS `opacity` 平滑显现，杜绝闪烁。

---

### 1. Overview & Core Concept

- **What It Does**: 为 PC 端主画布（`SvgCanvas`）及移动端主画布（`MobileStage`）的核心大图资源建立矢量纯色几何底衬层，在网络拉取图片完成之前即时展现结构完整的极简视觉构图。
- **Target Audience / Persona**: 在弱网、高延迟或首次冷启动时访问网站的访客及招聘官，进入页面第 0 毫秒即可看到清晰稳重的画作轮廓，无白屏、无空白相框感。
- **Key Value**: 消除大图加载期间的白屏或突兀空洞感，以符合画廊/作品集工艺质感的极简几何色块作为天然占位，提升首屏感知体验。

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. 访客首次打开页面，在图片资源尚未下载完成的瞬间，主画布已即刻显现出完整的构图框架：
     - 斜切 70° 的暖灰撕纸几何背景块。
     - 居右的拍立得几何矩形外框与内衬感光区。
     - 相框内的人物深色极简几何剪影。
  2. 随着图片资源在后台下载完成，真实的高保真纹理与人像照片平滑渐变显现，完美贴合在几何色块之上。
  3. 若出现弱网或资源受限，极简几何形状依然形成一副具有现代野兽派/包豪斯风格的剪影艺术画，内容依然完整耐看。

- **Visual Identity & Color Palette**:
  - *撕纸几何底衬 (Torn Paper Placeholder)*：`#dbd5c8` 暖纸灰纯色矩形条带，精确对应撕纸倾斜角度（`-70deg`）。
  - *拍立得几何外框 (Polaroid Frame Placeholder)*：
    - 外边框：`#242220` 深碳灰几何矩形（尺寸 `740×918`，圆角 `rx=6`）。
    - 感光内芯：`#f2efe8` 米白纯色矩形（尺寸 `620×650`）。
  - *人物剪影 (Portrait Silhouette Placeholder)*：
    - 下层身躯：`#2b2827` 深灰几何多边形/弧度矩形（`610×813`）。
    - 上层头部与轮廓：`#34302f` 微对比深灰几何轮廓（`568×780`）。

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: 几何色块放在底层（Underlay）还是替代模式（Conditional Toggle）**
  - *Chosen Approach*: **底层静态几何底衬法 (Static Layer Underlay)**。几何色块始终作为最底层原生矢量图形存在，上层的 `<image>` 默认透明并在加载完成后淡入。
  - *Why*: 避免条件渲染 `if (!loaded)` 切换瞬间带来的 DOM 重新挂载与重新重绘闪烁（Zero Layout Shift）；即便图片有半透明或柔光边缘，底部形状也能起到自然的阴影衬底作用。
  - *Alternatives Considered*: 使用 React state 切换 `<rect>` 与 `<image>`。此方式容易在状态跳变瞬间造成 1 帧的空白或闪烁，且增加了额外的重渲染开销。

- **Decision 2: 几何复杂度控制（极简几何 vs 复杂 SVG 轮廓路径）**
  - *Chosen Approach*: 极简纯色几何轮廓（Rounded Rects & Clean Polygons）。
  - *Why*: 遵循用户明确选择的“Simplified solid geometric outlines”，加载速度最快（代码体积几乎为零），视觉纯粹高级，符合极简艺术风格。

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌─────────────────────────────────────────────────────────────────┐
│                     SvgCanvas Hero Artboard                     │
│                                                                 │
│  [Layer 1: Background & Torn Paper]                            │
│  ├── <rect> Solid Color Torn Paper Strip (Fill: #dbd5c8)        │  <- 即时可见
│  └── <image> /pc_bg_torn.png (Opacity 0 -> 1 on load)          │
│                                                                 │
│  [Layer 2: Polaroid Frame Package]                              │
│  ├── Outer Frame: <rect> Solid Charcoal (#242220)              │  <- 即时可见
│  ├── Inner Mat: <rect> Solid Off-White (#f2efe8)               │  <- 即时可见
│  └── <image> /pc_frame.png (Opacity 0 -> 1 on load)            │
│                                                                 │
│  [Layer 3: Portrait Silhouette Package (Bottom & Top)]          │
│  ├── Portrait Body: <rect>/<path> Silhouette (#2b2827)          │  <- 即时可见
│  ├── <image> /pc_portrait_bottom.png                           │
│  ├── Portrait Head/Details: Silhouette (#34302f)               │  <- 即时可见
│  └── <image> /pc_portrait_top.png                              │
│                                                                 │
│  [Layer 4: Holographic Sheen & Badge]                          │
│  └── (Existing base circles & sheen filters)                   │
└─────────────────────────────────────────────────────────────────┘
```

- **State Management & Image Tracking**:
  - `heroAssetsLoaded`: 记录主画布各层加载状态的轻量 map 或计数器。
  - 利用原生 `<image onLoad={...}>` 事件驱动渐变透明度（`opacity-100`）。
- **Affected Components**:
  - `src/components/SvgCanvas.tsx`: PC 端撕纸条带、外框、上下肖像图层增加纯色几何形状衬底。
  - `src/components/MobileStage.tsx`: 移动端主舞台对应撕纸、相框、肖像图层同步增加纯色几何形状衬底。

---

### 5. Step-by-Step Implementation Plan

1. **Step 1: 在 `SvgCanvas.tsx` 中为主画布构建纯色几何占位图层**
   - 在撕纸条带（Torn Paper Extension & Main Strips）下方添加对应尺寸和位置的纯色 SVG `<rect fill="#ded9cd" rx={4} />`。
   - 在相框（Polaroid Frame）下方构建双层结构纯色几何形状：外层深碳色实心矩形 + 内层感光纸纯色矩形。
   - 在肖像底图（Portrait Bottom）与肖像顶图（Portrait Top）下方添加对应轮廓区域的纯色深灰几何形状。
2. **Step 2: 配置图片加载状态与淡入动效**
   - 为各个主画布 `<image>` 标签绑定平滑的 `opacity` 过渡样式与加载监听，确保未加载时纯色几何块完全发挥支撑作用，加载后自然无缝融合。
3. **Step 3: 在 `MobileStage.tsx` 中同步移动端主画布几何底衬**
   - 在移动端相框、肖像与撕纸容器中植入等比缩放的纯色几何底色与外框形状。
4. **Step 4: 构建与验证**
   - 验证无图片/模拟图片延迟加载时的静态画面几何美感。
   - 运行 `compile_applet` 与 `lint_applet` 确保构建零报错。

---

### 6. Verification & Test Plan

- **Visual Quality Verification**:
  - 检查未加载图片时相框区域是否具备完整的纯色矩形轮廓。
  - 检查撕纸区域是否具备倾斜的暖色纸张几何条带。
  - 检查肖像区域是否具备深色几何人物重心块。
- **Crossfade & Transition Verification**:
  - 图片加载完成后，图像平滑覆盖几何色块，无闪烁、无位移。
- **Responsiveness & Parallax Verification**:
  - 纯色几何图层与图片处于同一 SVG 变换分组中，随鼠标/陀螺仪视差与抽屉推拉联动，坐标 100% 同步。
