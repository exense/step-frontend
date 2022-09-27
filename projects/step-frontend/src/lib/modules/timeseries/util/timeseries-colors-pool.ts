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
   * @param key - If it is new, a new color will be assigned, otherwise a new color is generated.
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
      return this.assignColor(key);
    }
  }

  randomRGBA(): string {
    var o = Math.round,
      r = Math.random,
      s = 255;
    let alpha = Math.max(Number(r().toFixed(1)), 0.5);
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + alpha + ')';
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

const colors = ['#c90e00', '#ffa845', '#009359', '#050c91', '#7baaff', '#ffd61f'];

const statusColors: { [key: string]: string } = {
  passed: '#009359',
  failed: '#c71300',
  [TimeseriesColorsPool.NO_STATUS]: TimeseriesColorsPool.GREY_COLOR,
};
