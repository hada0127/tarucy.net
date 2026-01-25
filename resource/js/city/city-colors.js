/**
 * city-colors.js
 * Hong Kong Citypop Night City - Color Palettes
 *
 * Shared color constants used across all city modules.
 */

// ============================================
// Color Palettes
// ============================================
export const colors = {
  // Building body colors (dark blue-purple)
  building: [
    0x2a3050, 0x352848, 0x2d3555, 0x3a2850,
    0x303858, 0x3d3060, 0x283048, 0x352d55
  ],
  // Window colors (pink/magenta 70%, cyan 30%)
  window: [
    0xff6090, 0xff5080, 0xe06088,
    0xff7098, 0xf05078, 0xe85090,
    0x50d0e0, 0x60c8d8, 0x70e0f0
  ],
  // Neon sign colors (muted/desaturated, dimmer)
  neon: {
    pink: 0x905060,
    cyan: 0x508088,
    yellow: 0x908050,
    magenta: 0x805070,
    blue: 0x506088,
    green: 0x508060,
    red: 0x884848
  },
  // Wall/fence colors
  concrete: 0x4a4a5a,
  darkConcrete: 0x3a3a4a,
  wood: 0x5a4030
};

/**
 * Get a random color from a palette array
 * @param {number[]} palette - Array of hex colors
 * @returns {number} Random color from the palette
 */
export function randomColor(palette) {
  return palette[Math.floor(Math.random() * palette.length)];
}
