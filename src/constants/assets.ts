/**
 * Core visual assets that require early preloading
 * to ensure seamless first-paint and eliminate image popping.
 */
export const CORE_PRELOAD_ASSETS = [
  '/pc_bg_torn.png',
  '/pc_frame.png',
  '/pc_portrait_bottom.png',
  '/pc_portrait_top.png',
  '/pc_avatar_badge.png',
  '/pc_card_image.png',
  '/pc_logo.png',
  '/holo_texture.png',
  '/mobile_bg_torn.png',
  '/mobile_frame.png',
  '/mobile_portrait_bottom.png',
  '/mobile_portrait_top.png',
  '/mobile_avatar_badge.png',
  '/mobile_header_logo.png',
  '/logo_black_red.png',
  '/rotor_logo.png',
] as const;
