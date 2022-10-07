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
   * This method will create a gradient from the strokeColor to almost a transparent version of the stroke.
   * @param uPlot
   * @param strokeColor
   */
  static gradientFill(uPlot: uPlot, strokeColor: string) {
    let canvasHeight = uPlot.ctx.canvas.height;
    let gradient = uPlot.ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, strokeColor + '80');
    gradient.addColorStop(1, strokeColor + '08');
    return gradient;
  }

  /**
   * This method find the closest point in the chart (left-right) that is not null.
   * If the hovered point is not null, it is returned.
   * @param self
   * @param seriesIndex
   * @param hoveredIndex
   * @param cursorXVal
   */
  static closestNotEmptyPointFunction = (
    self: uPlot,
    seriesIndex: number,
    hoveredIndex: number,
    cursorXVal: number
  ) => {
    let xValues = self.data[0];
    let seriesData = self.data[seriesIndex];

    if (seriesData[hoveredIndex] == null) {
      let nonNullLeft = null;
      let nonNullRight = null;
      let i = hoveredIndex;

      while (nonNullLeft == null && i-- > 0) {
        // find the closest point in the left
        if (seriesData[i] != null) {
          nonNullLeft = i;
        }
      }

      i = hoveredIndex;
      while (nonNullRight == null && i++ < seriesData.length) {
        // find the closest point in the right
        if (seriesData[i] != null) {
          nonNullRight = i;
        }
      }

      if (nonNullLeft == null && nonNullRight == null) {
        return hoveredIndex;
      }

      let rightValue = nonNullRight == null ? Infinity : xValues[nonNullRight];
      let leftValue = nonNullLeft == null ? -Infinity : xValues[nonNullLeft];

      let leftDelta = cursorXVal - leftValue;
      let rightDelta = rightValue - cursorXVal;

      return leftDelta <= rightDelta ? nonNullLeft! : nonNullRight!;
    }

    return hoveredIndex;
  };
}
