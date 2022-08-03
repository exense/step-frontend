import * as uPlot from 'uplot';

export class UPlotUtils {
  static isZoomed(uplot: uPlot): boolean {
    let xData = uplot.data[0];
    return !(xData[0] === uplot.scales['x'].min && xData[xData.length - 1] === uplot.scales['x'].max);
  }

  static formatMilliseconds(value: number): string {
    if (value >= 1000) {
      let seconds = Math.floor(value / 1000);
      let decimal = String(Math.floor(value % 1000).toFixed(2))[0];
      return `${seconds}.${decimal} s`;
    } else {
      return Math.trunc(value) + ' ms';
    }
  }

  // @ts-ignore
  static closestNotEmptyPointFunction = (self, seriesIdx, hoveredIdx, cursorXVal) => {
    let xValues = self.data[0];
    let yValues = self.data[seriesIdx];

    // todo: only scan in-view indices

    if (yValues[hoveredIdx] == null) {
      let nonNullLft = null,
        nonNullRgt = null,
        i;

      i = hoveredIdx;
      while (nonNullLft == null && i-- > 0) {
        if (yValues[i] != null) nonNullLft = i;
      }

      i = hoveredIdx;
      while (nonNullRgt == null && i++ < yValues.length) {
        if (yValues[i] != null) nonNullRgt = i;
      }

      let rgtVal = nonNullRgt == null ? Infinity : xValues[nonNullRgt];
      let lftVal = nonNullLft == null ? -Infinity : xValues[nonNullLft];

      let lftDelta = cursorXVal - lftVal;
      let rgtDelta = rgtVal - cursorXVal;

      hoveredIdx = lftDelta <= rgtDelta ? nonNullLft : nonNullRgt;
    }

    return hoveredIdx;
  };
}
