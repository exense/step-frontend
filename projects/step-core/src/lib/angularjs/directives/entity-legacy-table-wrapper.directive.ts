import { IDirective, IScope } from 'angular';
import { LegacyTableHandle } from '../../modules/table/table.module';
import { SelectEntityContext } from '../../modules/entity/entity.module';

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
