import { IDirective } from 'angular';

export const SIMPLE_LINE_CHART_WRAPPER_DIRECTIVE = 'stepSimpleLineChartWrapper';

export class SimpleLineChartWrapperDirectiveCtrl {
  handle!: any;
  chartId!: string;
}

export const SimpleLineChartWrapper: IDirective = {
  restrict: 'E',
  scope: {
    chartId: '=',
    handle: '=',
  },
  controller: SimpleLineChartWrapperDirectiveCtrl,
  controllerAs: SIMPLE_LINE_CHART_WRAPPER_DIRECTIVE,
  bindToController: true,
  template: `<canvas
       id="{{${SIMPLE_LINE_CHART_WRAPPER_DIRECTIVE}.chartId}}"
       class="chart chart-line"
       handle="${SIMPLE_LINE_CHART_WRAPPER_DIRECTIVE}.handle"
       legend="true"
    >
   </canvas>`,
};
