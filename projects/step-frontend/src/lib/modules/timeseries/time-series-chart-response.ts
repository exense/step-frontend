import {Bucket} from './bucket';

export interface TimeSeriesChartResponse {
    start: number;
    end: number;
    interval: number;
    matrix: Bucket[][];
    matrixKeys: any[];
}
