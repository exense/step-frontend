import { IDirective } from 'angular';

export const TOOLTIP_DIRECTIVE = 'stepTooltip';

export class TooltipDirectiveCtrl {
  tooltip: string = '';
  appendToBody?: boolean;
}

export const TooltipDirective: IDirective = {
  restrict: 'E',
  scope: {
    tooltip: '=',
    appendToBody: '=',
  },
  transclude: true,
  controller: TooltipDirectiveCtrl,
  controllerAs: TOOLTIP_DIRECTIVE,
  bindToController: true,
  template: `<span uib-tooltip="{{${TOOLTIP_DIRECTIVE}.tooltip}}"
                   tooltip-append-to-body="${TOOLTIP_DIRECTIVE}.appendToBody">
        <ng-transclude></ng-transclude>
    </span>`,
};
