import { CompileCtx, compileModule, registerCompiledModules } from './shared/module-utils';

export const registerOsPlugins = async (ctx: CompileCtx): Promise<void> => {
  const { PluginModule } = await import('../os-plugins/plugin.module');
  const pluginModuleCompiled = await compileModule('os_plugin', PluginModule, ctx);
  if (!pluginModuleCompiled) {
    return;
  }
  await registerCompiledModules([pluginModuleCompiled]);
};
