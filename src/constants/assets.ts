/**
 * Critical visual assets and heavy web fonts categorized by platform
 * for genuine byte-level network preloading and GPU bitmap decoding.
 */
export const CORE_FONTS = [
  '/fonts/COPRGTB.TTF',
  '/fonts/FZFYSJW.TTF',
] as const;

export const PC_CORE_ASSETS = [
  ...CORE_FONTS,
  '/pc_bg_torn.png',
  '/pc_frame.png',
  '/pc_portrait_bottom.png',
  '/pc_portrait_top.png',
  '/pc_avatar_badge.png',
  '/pc_card_image.png',
  '/pc_logo.png',
  '/holo_texture.png',
] as const;

export const MOBILE_CORE_ASSETS = [
  ...CORE_FONTS,
  '/mobile_bg_torn.png',
  '/mobile_frame.png',
  '/mobile_portrait_bottom.png',
  '/mobile_portrait_top.png',
  '/mobile_avatar_badge.png',
  '/mobile_header_logo.png',
  '/holo_texture.png',
] as const;

export const CORE_PRELOAD_ASSETS = [
  ...CORE_FONTS,
  '/mobile_bg_torn.png',
  '/mobile_frame.png',
  '/mobile_portrait_bottom.png',
  '/mobile_portrait_top.png',
  '/mobile_avatar_badge.png',
  '/mobile_header_logo.png',
  '/pc_bg_torn.png',
  '/pc_frame.png',
  '/pc_portrait_bottom.png',
  '/pc_portrait_top.png',
  '/pc_avatar_badge.png',
  '/holo_texture.png',
] as const;
