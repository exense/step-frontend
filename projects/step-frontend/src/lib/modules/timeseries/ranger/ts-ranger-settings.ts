import {TSChartSeries} from '../chart/model/ts-chart-settings';

export interface TSRangerSettings {

    min: number;
    max: number;
    interval: number;
    series: TSChartSeries[];

}
