export class SeriesColorsPool {
    private allColors: string[];
    private assignedColors: {[key: string]: string} = {};

  constructor() {
      this.allColors = [...colors];
  }

  assignColor(key: string): string {
      if (this.allColors.length == 0) {
          throw new Error('There are not enough colors in the pool');
      }
      let color = this.allColors[0];
      this.assignedColors[key] = color;
      this.allColors.shift();
      return color;
  }

  getColor(key: string): string {
      if (this.assignedColors[key]) return this.assignedColors[key];
      return this.assignColor(key);
  }

}

const colors = [
    '#c90e00',
    '#ffa845',
    '#009359',
    '#050c91',
    '#7baaff',
    '#ffd61f'
];
