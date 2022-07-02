export class TimeseriesColorsPool {
  private allColors: string[];
  private assignedColors: { [key: string]: string } = {};

  constructor() {
    this.allColors = [...colors];
  }

  assignColor(key: string): string {
    if (this.allColors.length == 0) {
      let randomColor = this.randomRGBA();
      this.allColors.push(randomColor);
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

  randomRGBA() {
    var o = Math.round,
      r = Math.random,
      s = 255;
    let alpha = Math.max(Number(r().toFixed(1)), 0.5);
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + alpha + ')';
  }

  getStatusColor(status: string): string {
    if (!status) {
      let randomColor = this.randomRGBA();
      statusColors[status.toLowerCase()] = randomColor;
      return randomColor;
    } else {
      return statusColors[status.toLowerCase()];
    }
  }
}

const colors = ['#c90e00', '#ffa845', '#009359', '#050c91', '#7baaff', '#ffd61f'];

const statusColors: { [key: string]: string } = {
  passed: '#009359',
  failed: '#c71300',
};
