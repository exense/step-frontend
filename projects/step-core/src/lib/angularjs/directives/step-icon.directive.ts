import { IScope, IDirectiveFactory, Injectable, IAttributes } from 'angular';

export const STEP_ICON_DIRECTIVE_NAME = 'stepAjsIcon';
export const STEP_ICON_CLASS = 'step-ajs-icon';

export const STEP_ICON_DIRECTIVE: Injectable<IDirectiveFactory> = [
  'iconProverService',
  (iconProverService: any) => ({
    restrict: 'EC',
    template: '',
    link: function ($scope: IScope, $el: JQLite, $attr: IAttributes) {
      const resolveName = () => {
        let name = ($attr as any).name;
        if (name) {
          return name;
        }
        const classValueParts = ($el[0].className || '').split(' ');
        const index = classValueParts.indexOf(STEP_ICON_CLASS);
        name = classValueParts[index + 1];
        return name;
      };

      const name = resolveName();
      const icon = iconProverService.getIcon(name);
      if (icon) {
        $el.html(icon);
      }
    },
  }),
];
