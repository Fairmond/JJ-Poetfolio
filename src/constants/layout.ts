/**
 * PC Artboard geometric specifications and coordinate constants.
 * Standard base canvas design: 1920 x 1088.
 */
export const PC_CANVAS_WIDTH = 1920;
export const PC_CANVAS_HEIGHT = 1088;
export const PC_ASPECT_RATIO = PC_CANVAS_WIDTH / PC_CANVAS_HEIGHT; // ≈ 1.7647

/**
 * Drawer geometric specifications in the SVG canvas coordinate system:
 * - The main drawer card starts at x = 1928 (translate(1928 107))
 * - The card width is 870px (<rect width={870} />)
 * - Initial right edge: 1928 + 870 = 2798px
 * - Initial center line: 1928 + 870 / 2 = 2363px
 * - The tab handle seam is at x = 1923, which aligns with windowRightInCanvas when closed.
 */
export const PC_DRAWER = {
  PANEL_ORIGIN_X: 1928,
  PANEL_WIDTH: 870,
  PANEL_HEIGHT: 943,
  PANEL_RIGHT_X: 1928 + 870, // 2798px
  PANEL_CENTER_X: 1928 + 870 / 2, // 2363px
  PANEL_HANDLE_ROOT_X: 1923,
  // 3% margin of panel width:
  SAFE_MARGIN_RATIO: 0.03, // 26.1px
} as const;

/**
 * Central Photo Frame geometric constants:
 * Frame spans from 960px to 1700px (width 740px), unshifted center is at 1330px.
 */
export const PC_HERO_FRAME = {
  ORIGIN_CENTER: 1330,
} as const;

/**
 * Mobile Drawer / Stage specifications.
 */
export const MOBILE_STAGE = {
  MAX_WIDTH: 430,
  DEFAULT_WIDTH: 393,
  DEFAULT_HEIGHT: 852,
  DESIGN_W: 407.521,
  DESIGN_H: 647.218,
  PEEK_HANDLE_HEIGHT: 48,
} as const;
