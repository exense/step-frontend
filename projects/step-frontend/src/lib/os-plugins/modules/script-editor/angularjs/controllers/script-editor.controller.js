scriptEditorCtrl.$inject = ['$scope', 'stateStorage'];
export function scriptEditorCtrl($scope, stateStorage) {
  stateStorage.push($scope, 'scripteditor', {});
}
