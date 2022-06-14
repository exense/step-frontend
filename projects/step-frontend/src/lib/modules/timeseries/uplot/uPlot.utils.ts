import * as uPlot from 'uplot';

export class UPlotUtils {
    static isZoomed(uplot: uPlot): boolean {
        let xData = uplot.data[0];
        return !(xData[0] === uplot.scales['x'].min &&
            xData[xData.length - 1] === uplot.scales['x'].max);
    }
}
