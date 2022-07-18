import { getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';
import { IDirective } from 'angular';

export const KEYWORD_WRAPPER = 'stKeywordWrapper';

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive(KEYWORD_WRAPPER, [
    function (): IDirective {
      return {
        restrict: 'E',
        scope: {
          stepsTable: '=',
          stepsTableServerSideParameters: '=',
        },
        template: `<ng-include src="'partials/executions/keywordCalls.html'"/>`,
      };
    },
  ]);
