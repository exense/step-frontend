export type RGB = { r: number; g: number; b: number };

export class HeatmapColorUtils {
  static hexToRgb(hex: string): RGB {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) throw new Error('Invalid hex color');
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  }

  static rgbToHex(rgb: RGB): string {
    const toHex = (n: number) =>
      Math.max(0, Math.min(255, Math.round(n)))
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * @param base
   * @param color
   * @param colorWeight a number in [0, 1] interval, representing the percentage
   */
  static addColor(base: RGB, color: RGB, colorWeight: number): RGB {
    const maxValue = 255;
    return {
      r: Math.min(base.r + color.r * colorWeight, maxValue),
      g: Math.min(base.g + color.g * colorWeight, maxValue),
      b: Math.min(base.b + color.b * colorWeight, maxValue),
    };
  }

  static rgbSum(color1: RGB, color2: RGB): RGB {
    const maxValue = 255;
    return {
      r: Math.min(color1.r + color2.r, maxValue),
      g: Math.min(color1.g + color2.g, maxValue),
      b: Math.min(color1.b + color2.b, maxValue),
    };
  }
}
