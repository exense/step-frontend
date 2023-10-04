import { IDirective, IScope } from 'angular';
import { getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, ViewStateService } from '@exense/step-core';

export const LEGACY_OUTLET = 'stLegacyOutlet';

legacyOutletWrapper.$inject = ['ViewState'];
export function legacyOutletWrapper(viewState: ViewStateService): IDirective {
  return {
    restrict: 'E',
    scope: {},
    link: ($scope: IScope) => {
      const subscription = viewState.viewTemplate$.subscribe((viewTemplate) => {
        ($scope as any).viewTemplate = viewTemplate;
      });

      $scope.$on('$destroy', () => subscription.unsubscribe());
    },
    template: `<ng-include src="viewTemplate"></ng-include>`,
  };
}

getAngularJSGlobal().module(AJS_MODULE).directive(LEGACY_OUTLET, legacyOutletWrapper);
