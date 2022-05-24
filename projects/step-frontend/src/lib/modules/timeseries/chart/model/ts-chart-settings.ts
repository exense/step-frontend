export interface TSChartSettings {
    title: string;
    xValues: number[]; // in seconds
    series: TSChartSeries[];
    autoResize?: boolean;
}

export interface TSChartSeries {
    hidden?: boolean;
    data: number[];
    label: string;
    valueFormatFunction: (value: number) => string;
    stroke?: string;
    fill?: string;
}
