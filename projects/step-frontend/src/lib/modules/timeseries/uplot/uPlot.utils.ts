import * as uPlot from 'uplot';

export class UPlotUtils {
  /**
   * Return true if the chart is zoomed, or false otherwise.
   * @param uplot
   */
  static isZoomed(uplot: uPlot): boolean {
    let xData = uplot.data[0];
    // first or last 'visible' items are different from the first and last items that actually exist in the chart.
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

  /**
   * This method find the closest point in the chart (left-right) that is not null.
   * If the hovered point is not null, it is returned.
   * @param self
   * @param seriesIdx
   * @param hoveredIdx
   * @param cursorXVal
   */
  static closestNotEmptyPointFunction = (self: uPlot, seriesIdx: number, hoveredIdx: number, cursorXVal: number) => {
    let xValues = self.data[0];
    let seriesData = self.data[seriesIdx];

    if (seriesData[hoveredIdx] == null) {
      let nonNullLft = null;
      let nonNullRgt = null;
      let i = hoveredIdx;

      while (nonNullLft == null && i-- > 0) {
        // find the closest point in the left
        if (seriesData[i] != null) nonNullLft = i;
      }

      i = hoveredIdx;
      while (nonNullRgt == null && i++ < seriesData.length) {
        // find the closest point in the right
        if (seriesData[i] != null) nonNullRgt = i;
      }

      if (nonNullLft == null && nonNullRgt == null) {
        return hoveredIdx;
      }

      let rgtVal = nonNullRgt == null ? Infinity : xValues[nonNullRgt];
      let lftVal = nonNullLft == null ? -Infinity : xValues[nonNullLft];

      let lftDelta = cursorXVal - lftVal;
      let rgtDelta = rgtVal - cursorXVal;

      return lftDelta <= rgtDelta ? nonNullLft! : nonNullRgt!;
    }

    return hoveredIdx;
  };
}
