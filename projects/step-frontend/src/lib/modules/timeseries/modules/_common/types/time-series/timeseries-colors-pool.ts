import { SeriesStroke } from './series-stroke';
import { SeriesStrokeType } from './series-stroke-type';

const PREDEFINED_COLORS: Record<string, string> = {
  TECHNICAL_ERROR: '#000000',
  FAILED: '#d9534f',
  INTERRUPTED: '#f9c038',
  PASSED: '#5cb85c',
  SKIPPED: '#a0a0a0',
  NORUN: '#a0a0a0',
  RUNNING: '#337ab7',
  '': '#cccccc',
};

/**
 * The pool is responsible for storing and assigning one color for every unique string key. A list of predefined colors are stored in the pool.
 * If more keys are requested, new random colors will be generated and stored in the pool.
 */
export class TimeseriesColorsPool {
  static readonly STROKE_TYPES: SeriesStrokeType[] = [
    SeriesStrokeType.NORMAL,
    SeriesStrokeType.DASHED,
    SeriesStrokeType.DOTTED,
  ];

  private predefinedColors: string[];
  private assignedColors: { [key: string]: SeriesStroke } = {}; // every unique key has a unique color assigned
  private nextPredefinedColorsIndex = 0;

  constructor() {
    this.predefinedColors = [...defaultColors];
  }

  /**
   * @param key - If it is not new, the existing value will be returned, otherwise a new color is generated.
   */
  private assignColor(key: string): SeriesStroke {
    let stroke: SeriesStroke;
    const alreadyAssignedStrokes = Object.keys(this.assignedColors).length;
    if (alreadyAssignedStrokes >= this.predefinedColors.length * TimeseriesColorsPool.STROKE_TYPES.length) {
      // there are no more 'predefined' options for next series
      stroke = { type: SeriesStrokeType.NORMAL, color: this.randomRGBA() };
    } else {
      const existingColor = this.predefinedColors[this.nextPredefinedColorsIndex++];
      if (this.nextPredefinedColorsIndex > this.predefinedColors.length) {
        this.nextPredefinedColorsIndex = 0;
      }
      const strokeType =
        TimeseriesColorsPool.STROKE_TYPES[Math.trunc(alreadyAssignedStrokes / this.predefinedColors.length)];
      console.log(strokeType);
      stroke = { type: strokeType, color: existingColor };
    }
    this.assignedColors[key] = stroke;
    return stroke;
  }

  /**
   * Return the color for a given key. If the key has no color attached, a new one will be created.
   */
  getSeriesColor(key: string): SeriesStroke {
    if (this.assignedColors[key]) {
      return this.assignedColors[key];
    } else {
      let predefinedcolor = PREDEFINED_COLORS[key];
      if (predefinedcolor) {
        return { color: predefinedcolor, type: SeriesStrokeType.NORMAL };
      } else {
        return this.assignColor(key);
      }
    }
  }

  randomRGBA(): string {
    const rgb = this.randomRGB();
    // Generate alpha value (0.5 to 1 range)
    const toHex = (num: number) => num.toString(16).padStart(2, '0');
    // const alpha = Math.max(Number(Math.random().toFixed(1)), 0.5);
    const alpha = 0.3;
    const alphaHex = toHex(Math.round(alpha * 255));
    return `${rgb}${alphaHex}`;
  }

  randomRGB(): string {
    // Convert a number to a 2-digit hexadecimal string
    const toHex = (num: number) => num.toString(16).padStart(2, '0');

    // Generate random RGB values - don't go up to 255 to be more visible
    const red = Math.round(Math.random() * 200);
    const green = Math.round(Math.random() * 200);
    const blue = Math.round(Math.random() * 200);

    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
  }
}

const defaultColors = [
  '#0050aa90',
  '#32aaa080',
  '#ff861380',
  '#6758ff80',
  '#00a5f180',
  '#0eab1e80',
  '#8400b980',
  '#ff525280',
  '#15471980',
  '#b167cf80',
  '#53cb5e80',
  '#e0000080',
  '#79290080',
  '#75a63080',
  '#af000080',
  '#0000ab80',
  '#c6128780',
  '#4995c480',
  '#27856c80',
  '#ce560080',
  '#50cb9c80',
  '#a9780080',
  '#c341ca80',
  '#814d1080',
];
