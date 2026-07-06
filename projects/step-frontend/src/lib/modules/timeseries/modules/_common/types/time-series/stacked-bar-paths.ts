import type uPlot = require('uplot');

interface StackedBarPathOptions {
  size: [number, number, number?];
  align?: -1 | 0 | 1;
  radius?: number;
  gap?: number;
  stackStartSeriesIdx?: number;
  stackEndSeriesIdx: number;
}

const DEFAULT_MIN_WIDTH = 1;
const DEFAULT_ALIGN = 0;
const DEFAULT_RADIUS = 0;
const DEFAULT_GAP = 0;

export function createStackedBarPaths(options: StackedBarPathOptions): uPlot.Series.PathBuilder {
  const align = options.align ?? DEFAULT_ALIGN;
  const radius = options.radius ?? DEFAULT_RADIUS;
  const gap = options.gap ?? DEFAULT_GAP;
  const stackStartSeriesIdx = options.stackStartSeriesIdx ?? 1;

  return (self: uPlot, seriesIdx: number, idx0: number, idx1: number): uPlot.Series.Paths => {
    const path = new Path2D();
    const xData = self.data[0] as number[];
    const yData = self.data[seriesIdx] as (number | null | undefined)[];
    const series = self.series[seriesIdx];
    const scaleKey = series.scale ?? 'y';
    const strokeWidth = Math.round((series.width ?? 0) * devicePixelRatio);
    const barWidth = getBarWidth(self, xData, yData, strokeWidth, options.size, gap);
    const xShift = getXShift(barWidth, align, gap);

    for (let i = idx0; i <= idx1; i++) {
      const value = yData[i];
      if (value == null) {
        continue;
      }

      const previousValue = getPreviousStackValue(self, seriesIdx, i, stackStartSeriesIdx);
      const segmentValue = value - previousValue;
      if (segmentValue <= 0) {
        continue;
      }

      const xPos = self.valToPos(xData[i], 'x', true);
      const yPos = self.valToPos(value, scaleKey, true);
      const y0Pos = self.valToPos(previousValue, scaleKey, true);
      const left = Math.round(xPos - xShift);
      const top = Math.round(Math.min(yPos, y0Pos));
      const bottom = Math.round(Math.max(yPos, y0Pos));
      const height = bottom - top;
      if (height <= 0) {
        continue;
      }

      if (isTopStackSegment(self, seriesIdx, i, stackStartSeriesIdx, options.stackEndSeriesIdx)) {
        drawTopRoundedRect(path, left, top, barWidth, height, radius * barWidth);
      } else {
        path.rect(left, top, barWidth, height);
      }
    }

    return { stroke: path, fill: path };
  };
}

function getPreviousStackValue(self: uPlot, seriesIdx: number, dataIdx: number, stackStartSeriesIdx: number): number {
  if (seriesIdx <= stackStartSeriesIdx) {
    return 0;
  }
  return ((self.data[seriesIdx - 1] as (number | null | undefined)[])[dataIdx] as number | undefined) ?? 0;
}

function isTopStackSegment(
  self: uPlot,
  seriesIdx: number,
  dataIdx: number,
  stackStartSeriesIdx: number,
  stackEndSeriesIdx: number,
): boolean {
  for (let i = stackEndSeriesIdx; i >= stackStartSeriesIdx; i--) {
    if (self.series[i]?.show === false) {
      continue;
    }
    const currentValue = ((self.data[i] as (number | null | undefined)[])[dataIdx] as number | undefined) ?? 0;
    const previousValue = getPreviousStackValue(self, i, dataIdx, stackStartSeriesIdx);
    if (currentValue > previousValue) {
      return i === seriesIdx;
    }
  }
  return false;
}

function getBarWidth(
  self: uPlot,
  xData: number[],
  yData: (number | null | undefined)[],
  strokeWidth: number,
  size: [number, number, number?],
  gap: number,
): number {
  const pixelRatio = devicePixelRatio || 1;
  const maxWidth = size[1] * pixelRatio;
  const minWidth = (size[2] ?? DEFAULT_MIN_WIDTH) * pixelRatio;
  const extraGap = gap * pixelRatio;
  let columnWidth = self.bbox.width;
  let previousIdx: number | undefined;

  for (let i = 0; i < xData.length; i++) {
    if (yData[i] === undefined) {
      continue;
    }
    if (previousIdx !== undefined) {
      const width = Math.abs(self.valToPos(xData[i], 'x', true) - self.valToPos(xData[previousIdx], 'x', true));
      columnWidth = Math.min(columnWidth, width);
    }
    previousIdx = i;
  }

  return Math.round(Math.min(maxWidth, Math.max(minWidth, columnWidth * size[0])) - strokeWidth - extraGap);
}

function getXShift(barWidth: number, align: -1 | 0 | 1, gap: number): number {
  const extraGap = gap * (devicePixelRatio || 1);
  return (align === 0 ? barWidth / 2 : align === 1 ? 0 : barWidth) - (align * extraGap) / 2;
}

function drawTopRoundedRect(path: Path2D, x: number, y: number, width: number, height: number, radius: number): void {
  const boundedRadius = Math.min(radius, width / 2, height);
  if (boundedRadius <= 0) {
    path.rect(x, y, width, height);
    return;
  }

  path.moveTo(x, y + height);
  path.lineTo(x, y + boundedRadius);
  path.arcTo(x, y, x + boundedRadius, y, boundedRadius);
  path.lineTo(x + width - boundedRadius, y);
  path.arcTo(x + width, y, x + width, y + boundedRadius, boundedRadius);
  path.lineTo(x + width, y + height);
  path.closePath();
}
