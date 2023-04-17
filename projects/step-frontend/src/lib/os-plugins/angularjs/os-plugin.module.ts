import { getAngularJSGlobal } from '@angular/upgrade/static';

export const osPluginModule = getAngularJSGlobal().module('osPluginModule', ['step']);
