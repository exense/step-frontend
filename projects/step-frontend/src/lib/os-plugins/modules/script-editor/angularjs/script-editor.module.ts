import { scriptEditorCtrl } from './controllers/script-editor.controller';
import { getAngularJSGlobal } from '@angular/upgrade/static';

export const scriptEditorModule = getAngularJSGlobal()
  .module('scriptEditor', ['step'])
  .controller('ScriptEditorCtrl', scriptEditorCtrl);
