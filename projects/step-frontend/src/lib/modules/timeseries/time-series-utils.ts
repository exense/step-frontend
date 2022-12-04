import { TSTimeRange } from './chart/model/ts-time-range';
import { FilterBarItemType, TsFilterItem } from './performance-view/filter-bar/model/ts-filter-item';

export class TimeSeriesUtils {
  static createTimeLabels(start: number, end: number, interval: number): number[] {
    let intervals = Math.ceil((end - start) / interval);
    const result = Array(intervals);
    for (let i = 0; i < intervals; i++) {
      result[i] = start + i * interval; //
    }
    // result[intervals] = result[intervals - 1] + TimeSeriesConfig.RESOLUTION; // we add one second as a small padding

    return result;
  }

  static formatAxisValue(num: number): string {
    const lookup = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'k' },
      { value: 1e6, symbol: 'M' },
      { value: 1e9, symbol: 'B' },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return num >= item.value;
      });
    return item ? (num / item.value).toFixed(2).replace(rx, '$1') + item.symbol : '0';
  }

  static intervalIsInside(bigInterval: TSTimeRange, smallInterval: TSTimeRange): boolean {
    return !(bigInterval.from > smallInterval.from || bigInterval.to < smallInterval.to);
  }

  /**
   * If the intervals do not overlap, this method will return indefined.
   * @param boundaries
   * @param interval
   */
  static cropInterval(boundaries: TSTimeRange, interval: TSTimeRange): TSTimeRange | undefined {
    if (!this.intervalsOverlap(boundaries, interval)) {
      return undefined;
    }
    return { from: Math.max(boundaries.from, interval.from), to: Math.min(boundaries.to, interval.to) };
  }

  static intervalsOverlap(range1: TSTimeRange, range2: TSTimeRange) {
    return range1.from <= range2.to && range2.from <= range1.to;
  }

  static intervalsEqual(range1?: TSTimeRange, range2?: TSTimeRange) {
    return range1 && range2 && range1.from === range2.from && range1.to === range2.to;
  }
}
