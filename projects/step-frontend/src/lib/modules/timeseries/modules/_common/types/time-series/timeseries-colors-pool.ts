import { SeriesStroke } from './series-stroke';
import { MarkerType } from '@exense/step-core';

const PREDEFINED_COLORS: Record<string, string> = {
  TECHNICAL_ERROR: '#000000',
  FAILED: '#ff595b',
  INTERRUPTED: '#e1cc01',
  PASSED: '#01a990',
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
  static readonly STROKE_TYPES: MarkerType[] = [MarkerType.SQUARE, MarkerType.DASHED, MarkerType.DOTS];

  private predefinedColors: string[];
  private assignedColors: { [key: string]: SeriesStroke } = {}; // every unique key has a unique color assigned
  private nextPredefinedColorsIndex = 0;

  constructor() {
    this.predefinedColors = defaultColors;
  }

  /**
   * @param key - If it is not new, the existing value will be returned, otherwise a new color is generated.
   */
  private assignColor(key: string): SeriesStroke {
    let stroke: SeriesStroke;
    const alreadyAssignedStrokes = Object.keys(this.assignedColors).length;
    if (alreadyAssignedStrokes >= this.predefinedColors.length * TimeseriesColorsPool.STROKE_TYPES.length) {
      // there are no more 'predefined' options for next series
      stroke = { type: MarkerType.SQUARE, color: this.randomRGB() };
    } else {
      const existingColor = this.predefinedColors[this.nextPredefinedColorsIndex++];
      if (this.nextPredefinedColorsIndex === this.predefinedColors.length) {
        this.nextPredefinedColorsIndex = 0;
      }
      const strokeType =
        TimeseriesColorsPool.STROKE_TYPES[Math.trunc(alreadyAssignedStrokes / this.predefinedColors.length)];
      stroke = { type: strokeType, color: existingColor };
      if (!existingColor) {
        throw new Error(key);
      }
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
        return { color: predefinedcolor, type: MarkerType.SQUARE };
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
    const red = Math.round(Math.random() * 200 + 30);
    const green = Math.round(Math.random() * 200 + 30);
    const blue = Math.round(Math.random() * 200 + 30);

    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
  }
}

const defaultColors = [
  '#0050aa',
  '#32aaa0',
  '#ff8613',
  '#6758ff',
  '#2f95d0',
  '#29a136',
  '#8400b9',
  '#dc5959',
  '#266428',
  '#b167cf',
  '#5eb766',
  '#b0af00',
  '#792900',
  '#75a630',
  '#b24e11',
  '#26399b',
  '#c42d8b',
  '#4995c4',
  '#27856c',
  '#c75c12',
  '#50cb9c',
  '#a97800',
  '#b74fbe',
  '#814d10',
];
