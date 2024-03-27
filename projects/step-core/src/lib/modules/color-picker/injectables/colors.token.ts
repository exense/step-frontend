import { InjectionToken } from '@angular/core';

const makeHSLColor = (colorI: number, totalColors: number) => {
  if (totalColors < 1) {
    totalColors = 1;
  }
  const h = (colorI * (360 / totalColors)) % 360;
  const s = 0.6;
  const l = 0.3;
  return { h, s, l };
};

const hslToRgb = (h: number, s: number, l: number) => {
  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  // Having obtained RGB, convert channels to hex
  let rStr = Math.round((r + m) * 255).toString(16);
  let gStr = Math.round((g + m) * 255).toString(16);
  let bStr = Math.round((b + m) * 255).toString(16);

  // Prepend 0s, if necessary
  if (rStr.length == 1) rStr = `0${rStr}`;
  if (gStr.length == 1) gStr = `0${gStr}`;
  if (bStr.length == 1) bStr = `0${bStr}`;

  return `#${rStr}${gStr}${bStr}`;
};

const makeColor = (colorI: number, totalColors: number) => {
  const { h, s, l } = makeHSLColor(colorI, totalColors);
  return hslToRgb(h, s, l);
};

export const COLORS = new InjectionToken('List of various colors', {
  providedIn: 'root',
  factory: () => new Array(120).fill(0).map((_, i, self) => makeColor(i, self.length)),
});
