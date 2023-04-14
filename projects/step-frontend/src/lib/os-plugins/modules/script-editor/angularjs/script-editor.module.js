import { scriptEditorCtrl } from './controllers/script-editor.controller';

export const scriptEditorModule = angular
  .module('scriptEditor', ['step'])
  .controller('ScriptEditorCtrl', scriptEditorCtrl);
