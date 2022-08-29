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
}
