/**
 * Critical visual assets categorized by platform to avoid redundant network loading
 * and eliminate image pop-in on first paint.
 */
export const PC_CORE_ASSETS = [
  '/pc_bg_torn.png',
  '/pc_frame.png',
  '/pc_portrait_bottom.png',
  '/pc_portrait_top.png',
  '/pc_avatar_badge.png',
  '/pc_card_image.png',
  '/pc_logo.png',
  '/holo_texture.png',
  '/rotor_logo.png',
] as const;

export const MOBILE_CORE_ASSETS = [
  '/mobile_bg_torn.png',
  '/mobile_frame.png',
  '/mobile_portrait_bottom.png',
  '/mobile_portrait_top.png',
  '/mobile_avatar_badge.png',
  '/mobile_header_logo.png',
  '/holo_texture.png',
  '/rotor_logo.png',
] as const;

export const CORE_PRELOAD_ASSETS = [
  ...PC_CORE_ASSETS,
  ...MOBILE_CORE_ASSETS,
] as const;
