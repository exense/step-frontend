import { IDirective, IScope } from 'angular';
import { ArtefactContext } from '../../shared';
import { AbstractArtefact } from '../../client/generated';

export const ARTEFACT_DETAILS_EDITOR_WRAPPER = 'stepArtefactDetailsEditorWrapper';

interface ArtefactDetailsEditorWrapperScope extends IScope, Partial<ArtefactContext> {
  templateUrl: string;
  context: ArtefactContext;
}

export const ArtefactDetailedEditorWrapper: IDirective = {
  scope: {
    templateUrl: '=',
    context: '=',
  },
  link: ($scope: IScope) => {
    const scope = $scope as ArtefactDetailsEditorWrapperScope;

    scope.save = () => {
      scope.context.save();
    };

    scope.$watch('context.artefact', (value: AbstractArtefact | undefined) => {
      scope.artefact = value;
    });

    scope.$watch('context.readonly', (value: boolean | undefined) => {
      scope.readonly = value ?? false;
    });
  },
  template: `<ng-include src="templateUrl"/>`,
};
