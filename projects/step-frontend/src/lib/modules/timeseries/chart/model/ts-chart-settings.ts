import uPlot from '../../uplot/uPlot';
import Axis = uPlot.Axis;
import Series = uPlot.Series;

export interface TSChartSettings {
    title: string;
    xValues: number[]; // in seconds
    series: TSChartSeries[];
    autoResize?: boolean;
    axes?: Axis[];
}

export interface TSChartSeries extends Series{
    data: number[];
}
