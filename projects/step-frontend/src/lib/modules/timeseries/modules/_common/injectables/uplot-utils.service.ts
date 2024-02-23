import * as uPlot from 'uplot';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UPlotUtilsService {
  /**
   * Return true if the chart is zoomed, or false otherwise.
   * @param uplot
   */
  isZoomed(uplot: uPlot): boolean {
    let xData = uplot.data[0];
    // first or last 'visible' items are different from the first and last items that actually exist in the chart.
    return !(xData[0] === uplot.scales['x'].min && xData[xData.length - 1] === uplot.scales['x'].max);
  }

  /**
   * This method will create a gradient from the strokeColor to almost a transparent version of the stroke.
   * @param uPlot
   * @param strokeColor
   */
  gradientFill(uPlot: uPlot, strokeColor: string, [offsetStart, offsetEnd]: [number, number] = [0, 1]) {
    if (strokeColor.length > 7) {
      strokeColor = strokeColor.slice(0, 7); // remove existing opacity
    }
    return this.multiColorsGradientFill(uPlot, [
      { offset: offsetStart, color: `${strokeColor}80` },
      { offset: offsetEnd, color: `${strokeColor}10` },
    ]);
  }

  multiColorsGradientFill(uPlot: uPlot, steps: { offset: number; color: string }[]): CanvasGradient {
    const canvasHeight = uPlot.ctx.canvas.height;
    const gradient = uPlot.ctx.createLinearGradient(0, 0, 0, canvasHeight);
    steps.forEach(({ offset, color }) => gradient.addColorStop(offset, color));
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
  closestNotEmptyPointFunction = (self: uPlot, seriesIndex: number, hoveredIndex: number, cursorXVal: number) => {
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
