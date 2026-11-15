import React, { useId } from 'react';

/**
 * ScrollBottomInnerShadow — 滚动区域底部贴边内阴影组件
 *
 * 【已确立的需求与视觉规范文档】
 * 1. 定位与挂载方式
 *    - 必须作为“内部滚动视口容器”底部的前景浮层（`absolute inset-x-0 bottom-0 pointer-events-none z-30`），
 *      使滚动内容在经过视口底边时从阴影下方穿出，而非绘制在底框外层背景 SVG 上。
 *    - 父级滚动视口容器应包含 `relative overflow-hidden`（及匹配的底部圆角如 `rounded-b-lg`），确保边缘贴合裁切。
 *
 * 2. 色彩与边缘洁净度（杜绝脏白/灰边与色阶断层）
 *    - 严禁在阴影后方叠加 `#f7f5f0` 等白色或米白色半透明线性渐变垫底，避免经过深色卡片/视频区域时产生“脏白光晕”。
 *    - 阴影基色选用与纸面底色（`#f7f5f0`）同暖色系的暖暗褐色（默认 `#211b13`），避免纯黑 `#000000` 叠加后泛出冷灰脏感。
 *    - 使用 SVG 路径配合 `feGaussianBlur`（而非 5px 内强行压缩的 CSS `radial-gradient`），消除色阶条纹（Mach banding）与生硬边界。
 *
 * 3. 几何形态与紧实辐射范围
 *    - 纵向紧实贴底：主路径峰值控制在底边（`y = 24`）上方约 `1.7px`（`y = 22.3`），高斯模糊半径收紧至 `stdDeviation="0.75"`，
 *      滤波区域扩大至 `x="-10%" y="-100%" width="120%" height="300%"` 以防止模糊尾部被提前截断。
 *    - 两侧平缓收窄：采用三次贝塞尔钟形曲线（`M 0 24.4 C 26 24.4, 58 22.3, 150 22.3 C 242 22.3, 274 24.4, 300 24.4 Z`），
 *      中心段保持饱满紧贴，向左右两侧以平缓坡度收窄并贴合底边归零。
 *
 * 4. 双向“由深至浅”的层次过渡
 *    - 纵向由深至浅：在模糊滤镜分组 `<g>` 内部先应用 `userSpaceOnUse` 纵向亮度遮罩（`y = 24.2` 至 `y = 22.1`；
 *      底边根部 `0%~30%` 保持 `#ffffff` → `#f5f5f5` 较厚实深色带 → `65%` 处 `#969696` → 顶部边缘 `#262626`），
 *      再整体施加高斯模糊，形成“在 1.7px 紧实高度内贴边深实、向上柔和变浅消散”的压缝质感。
 *    - 横向由深至浅：通过中心至两侧的多段不透明度衰减（中心 `0.58` → `25%/75%` 处 `0.22` → `10%/90%` 处 `0.07` → 端点 `0`），
 *      保持整体辐射范围与收窄弧度不变的同时，使中间浓、两边浅的对比更清晰自然。
 *
 * 5. 多实例安全复用
 *    - 内部通过 `React.useId()` 为渐变、遮罩与滤镜生成唯一 ID，允许同一页面中多个滚动容器同时挂载而不发生 SVG defs 冲突。
 */
export interface ScrollBottomInnerShadowProps {
  /** 阴影基色，默认为适配暖白纸面的暖暗褐色 `#211b13` */
  color?: string;
  /** 中心峰值不透明度（叠加纵向遮罩与模糊前的基准值），默认 `0.58` */
  centerOpacity?: number;
  /** 高斯模糊半径，默认 `0.75`（保持紧实贴底的同时消除硬边） */
  blurStdDeviation?: number;
  /** 附加样式类（如自定义圆角或层级） */
  className?: string;
}

export const ScrollBottomInnerShadow: React.FC<ScrollBottomInnerShadowProps> = ({
  color = '#211b13',
  centerOpacity = 0.58,
  blurStdDeviation = 0.75,
  className = '',
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const fadeGradId = `scroll-bottom-shadow-fade-${uid}`;
  const vGradId = `scroll-bottom-shadow-vgrad-${uid}`;
  const vMaskId = `scroll-bottom-shadow-vmask-${uid}`;
  const blurFilterId = `scroll-bottom-shadow-blur-${uid}`;

  // 按中心峰值等比例计算两侧平滑衰减节点，保持横向由深至浅的层次比例一致
  const shoulderOpacity = Number((centerOpacity * (0.22 / 0.58)).toFixed(3));
  const edgeOpacity = Number((centerOpacity * (0.07 / 0.58)).toFixed(3));

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 24"
      preserveAspectRatio="none"
      className={`absolute inset-x-0 bottom-0 w-full h-6 pointer-events-none z-30 rounded-b-lg ${className}`.trim()}
    >
      <defs>
        <linearGradient id={fadeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="10%" stopColor={color} stopOpacity={edgeOpacity} />
          <stop offset="25%" stopColor={color} stopOpacity={shoulderOpacity} />
          <stop offset="50%" stopColor={color} stopOpacity={centerOpacity} />
          <stop offset="75%" stopColor={color} stopOpacity={shoulderOpacity} />
          <stop offset="90%" stopColor={color} stopOpacity={edgeOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>

        <linearGradient
          id={vGradId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="24.2"
          x2="0"
          y2="22.1"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#f5f5f5" />
          <stop offset="65%" stopColor="#969696" />
          <stop offset="100%" stopColor="#262626" />
        </linearGradient>

        <mask id={vMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="24">
          <rect x="0" y="0" width="300" height="24" fill={`url(#${vGradId})`} />
        </mask>

        <filter id={blurFilterId} x="-10%" y="-100%" width="120%" height="300%">
          <feGaussianBlur stdDeviation={blurStdDeviation} />
        </filter>
      </defs>

      <g filter={`url(#${blurFilterId})`}>
        <path
          d="M 0 24.4 C 26 24.4, 58 22.3, 150 22.3 C 242 22.3, 274 24.4, 300 24.4 Z"
          fill={`url(#${fadeGradId})`}
          mask={`url(#${vMaskId})`}
        />
      </g>
    </svg>
  );
};
