import { IDirective, IScope } from 'angular';
import { getAngularJSGlobal } from '@angular/upgrade/static';
import { LegacyTableHandle } from '../../../modules/table/table.module';
import { SelectEntityContext } from '../types/select-entity-context.interface';
import { STEP_CORE_JS } from '../../../angularjs';

export const ENTITY_LEGACY_TABLE_WRAPPER = 'stEntityLegacyTableWrapper';

interface EntityLegacyTableWrapperScope extends IScope {
  templateUrl: string;
  context: SelectEntityContext;
  multipleSelection?: boolean;
  tableHandle?: LegacyTableHandle;
  notifySelection?(selectedId: string): void;
}

export const EntityLegacyTableWrapper: IDirective = {
  scope: {
    templateUrl: '=',
    context: '=',
  },
  link: ($scope: IScope) => {
    const scope = $scope as EntityLegacyTableWrapperScope;
    scope.multipleSelection = scope.context.multipleSelection;
    scope.tableHandle = scope.context;

    scope.notifySelection = (selectedId: string) => {
      if (scope.context.handleSelect) {
        scope.context.handleSelect(selectedId);
      }
    };
  },
  template: `<ng-include src="templateUrl"/>`,
};

getAngularJSGlobal()
  .module(STEP_CORE_JS)
  .directive(ENTITY_LEGACY_TABLE_WRAPPER, [() => EntityLegacyTableWrapper]);
