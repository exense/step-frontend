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
  static readonly NO_STATUS = 'No status';
  static readonly GREY_COLOR = '#cccccc';

  private predefinedColors: string[];
  private assignedColors: { [key: string]: string } = {}; // every unique key has a unique color assigned

  constructor() {
    this.predefinedColors = [...colors];
  }

  /**
   * @param key - If it is not new, the existing value will be returned, otherwise a new color is generated.
   */
  assignColor(key: string): string {
    let color;
    if (this.predefinedColors.length == 0) {
      color = this.randomRGBA();
    } else {
      color = this.predefinedColors[0];
      this.predefinedColors.shift();
    }
    this.assignedColors[key] = color;
    return color;
  }

  /**
   * Return the color for a given key. If the key has no color attached, a new one will be created.
   * @param key
   */
  getColor(key: string): string {
    if (this.assignedColors[key]) {
      return this.assignedColors[key];
    } else {
      return PREDEFINED_COLORS[key] || this.assignColor(key);
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

  /**
   * These colors are globally scoped. Every pool will share the same status colors. When a color is requested for a new status, a new color is created.
   * @param status
   */
  getStatusColor(status: string): string {
    if (!status) {
      return statusColors[TimeseriesColorsPool.NO_STATUS];
    } else {
      let foundColor = statusColors[status.toLowerCase()];
      if (!foundColor) {
        foundColor = this.randomRGBA();
        statusColors[status.toLowerCase()] = foundColor;
      }
      return foundColor;
    }
  }
}

const colors = [
  'rgba(0,120,187,0.43)',
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

const statusColors: { [key: string]: string } = {
  technical_error: '#000000',
  failed: '#d9534f',
  interrupted: '#f9c038',
  passed: '#5cb85c',
  skipped: '#a0a0a0',
  norun: '#a0a0a0',
  running: '#337ab7',
  [TimeseriesColorsPool.NO_STATUS]: TimeseriesColorsPool.GREY_COLOR,
};
