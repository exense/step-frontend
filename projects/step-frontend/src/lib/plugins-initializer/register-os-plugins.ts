import { compileModule, registerCompiledModules } from './shared/module-utils';
import { Injector } from '@angular/core';

export const registerOsPlugins = async (injector: Injector): Promise<void> => {
  const { PluginModule } = await import('../os-plugins/plugin.module');
  const pluginModuleCompiled = compileModule('os_plugin', PluginModule, injector);
  if (!pluginModuleCompiled) {
    return;
  }
  return registerCompiledModules([pluginModuleCompiled]);
};
