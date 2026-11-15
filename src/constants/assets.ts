/**
 * 静态资源与双域名分流配置中心（同源静态资源 vs 腾讯云 COS 图床）
 *
 * 工作原理：
 * 1. 本地 `public/`（打包后在 `dist/`）与 COS 桶 `J Space/` 保持完全一致的目录结构：
 *    - `hero/portrait_bottom.png`、`hero/portrait_top.png`、`hero/avatar_badge.png`
 *    - `hero/holo_texture.png`、`hero/bg_torn.png`、`hero/frame.png`
 *    - `media/demo_video.mp4`
 * 2. 页面加载时根据当前访问域名 `window.location.hostname` 自动判断：
 *    - 命中 `STATIC_ASSET_HOSTS`（外网域名）→ 使用站点自带同源静态资源（`/hero/...`、`/media/...`），不耗 COS 流量；
 *    - 其他域名（内网 / 国内访问域名 / AI Studio 预览）→ 自动走腾讯云 COS 加速（`COS_BASE_URL`）。
 */
const envVars =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

const DEFAULT_COS_BASE_URL = 'https://jjdemon-1529884095.cos.ap-nanjing.myqcloud.com/J%20Space';

export const COS_BASE_URL = (envVars.VITE_CDN_BASE_URL || DEFAULT_COS_BASE_URL).replace(/\/+$/, '');

/**
 * 外网域名白名单（访问这些域名时直接走站点本地静态资源 `/hero/...` 与 `/media/...`）。
 * - 外网域名：`jj-poetfolio.2371402599.workers.dev` -> 走 Cloudflare Workers 同源静态资源
 * - 国内/内网域名：`jjdemon.cn`（含子域名）及 AI Studio 预览 -> 自动走腾讯云 COS 加速
 * 也可在构建环境变量 `VITE_STATIC_ASSET_HOSTS` 中以英文逗号分隔追加其他外网域名。
 */
const DEFAULT_STATIC_ASSET_HOSTS: readonly string[] = [
  'jj-poetfolio.2371402599.workers.dev',
];

const ENV_STATIC_ASSET_HOSTS = (envVars.VITE_STATIC_ASSET_HOSTS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

export const STATIC_ASSET_HOSTS: readonly string[] = [
  ...DEFAULT_STATIC_ASSET_HOSTS,
  ...ENV_STATIC_ASSET_HOSTS,
];

function matchesHostPattern(hostname: string, pattern: string): boolean {
  const host = hostname.toLowerCase();
  const rule = pattern.toLowerCase();
  if (!rule) return false;
  if (rule.startsWith('*.')) {
    const suffix = rule.slice(1); // '.domain.com'
    return host.endsWith(suffix) || host === rule.slice(2);
  }
  return host === rule;
}

export function isStaticAssetHost(hostname?: string): boolean {
  const currentHost =
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  if (!currentHost) return false;
  return STATIC_ASSET_HOSTS.some((pattern) => matchesHostPattern(currentHost, pattern));
}

export const ASSET_BASE_URL = isStaticAssetHost() ? '' : COS_BASE_URL;

export const resolveAssetUrl = (path: string): string => {
  const cleanPath = path.replace(/^\/+/, '');
  return ASSET_BASE_URL ? `${ASSET_BASE_URL}/${cleanPath}` : `/${cleanPath}`;
};

/**
 * 合并 PC 与移动端共用的一份高清主视觉资源（本地 `public/hero/` 与 COS `hero/` 1:1 镜像）
 */
export const HERO_ASSETS = {
  bgTorn: resolveAssetUrl('hero/bg_torn.png'),
  frame: resolveAssetUrl('hero/frame.png'),
  portraitBottom: resolveAssetUrl('hero/portrait_bottom.png'),
  portraitTop: resolveAssetUrl('hero/portrait_top.png'),
  avatarBadge: resolveAssetUrl('hero/avatar_badge.png'),
  holoTexture: resolveAssetUrl('hero/holo_texture.png'),
} as const;

/**
 * 媒体与展示资源（视频按域名自动分流本地/COS，轻量化封面保留本地秒开）
 */
export const MEDIA_ASSETS = {
  demoVideo: resolveAssetUrl('media/demo_video.mp4'),
  demoVideoPoster: '/demo_video_poster.jpg',
  coachPreview: '/coach_preview.jpg',
} as const;

/**
 * 轻量化本地字体（目前保留在 `public/fonts/` 下保证同源稳定加载）
 */
export const CORE_FONTS = [
  '/fonts/COPRGTB.TTF',
  '/fonts/FZFYSJW.TTF',
] as const;

export const PC_CORE_ASSETS = [
  ...CORE_FONTS,
  HERO_ASSETS.bgTorn,
  HERO_ASSETS.frame,
  HERO_ASSETS.portraitBottom,
  HERO_ASSETS.portraitTop,
  HERO_ASSETS.avatarBadge,
  HERO_ASSETS.holoTexture,
  '/pc_card_image.png',
  '/pc_logo.png',
] as const;

export const MOBILE_CORE_ASSETS = [
  ...CORE_FONTS,
  HERO_ASSETS.bgTorn,
  HERO_ASSETS.frame,
  HERO_ASSETS.portraitBottom,
  HERO_ASSETS.portraitTop,
  HERO_ASSETS.avatarBadge,
  HERO_ASSETS.holoTexture,
  '/mobile_header_logo.png',
] as const;

export const CORE_PRELOAD_ASSETS = [
  ...CORE_FONTS,
  HERO_ASSETS.bgTorn,
  HERO_ASSETS.frame,
  HERO_ASSETS.portraitBottom,
  HERO_ASSETS.portraitTop,
  HERO_ASSETS.avatarBadge,
  HERO_ASSETS.holoTexture,
  '/mobile_header_logo.png',
] as const;
