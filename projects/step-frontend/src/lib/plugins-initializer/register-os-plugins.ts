import { compileModule, registerCompiledModules } from './shared/module-utils';
import { Injector } from '@angular/core';
import { PluginModule } from '../os-plugins/plugin.module';

export const registerOsPlugins = (injector: Injector): Promise<void> => {
  const pluginModuleCompiled = compileModule('os_plugin', PluginModule, injector);
  if (!pluginModuleCompiled) {
    return Promise.resolve();
  }
  return registerCompiledModules([pluginModuleCompiled]);
};
