import { IScope } from 'angular';

scriptEditorCtrl.$inject = ['$scope', 'stateStorage'];
export function scriptEditorCtrl($scope: IScope, stateStorage: any) {
  stateStorage.push($scope, 'scripteditor', {});
}
