import { IScope, IDirectiveFactory, Injectable, IAttributes } from 'angular';

export const STEP_ICON_DIRECTIVE: Injectable<IDirectiveFactory> = [
  'iconProverService',
  (iconProverService: any) => ({
    restrict: 'E',
    template: '',
    link: function ($scope: IScope, $el: JQLite, $attr: IAttributes) {
      const name = ($attr as any).name;
      const icon = iconProverService.getIcon(name);
      if (icon) {
        $el.html(icon);
      }
    },
  }),
];
