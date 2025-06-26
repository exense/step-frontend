import { loadRemoteModule, LoadRemoteModuleOptions } from '@angular-architects/native-federation';
import { Injector, Type } from '@angular/core';
import { CompiledModule, compileModule, registerCompiledModules } from './shared/module-utils';

interface PluginModuleDeclaration {
  PluginModule: Type<any>;
}

export interface PluginCtx {
  entryPoint: string;
  declaration: PluginModuleDeclaration;
}

const loadModule = async (entryPoint: string): Promise<PluginCtx | undefined> => {
  let result: PluginCtx | undefined = undefined;
  try {
    let href = window.location.href;
    if (href.includes('#')) {
      href = href.substring(0, href.indexOf('#'));
    }
    if (!href.endsWith('/')) {
      href += '/';
    }

    const remoteEntry = href + entryPoint;

    const options: LoadRemoteModuleOptions = {
      //type: 'module',
      exposedModule: './Module',
      remoteEntry,
    };
    const declaration = await loadRemoteModule<PluginModuleDeclaration>(options);
    result = {
      entryPoint,
      declaration,
    };
  } catch (e) {
    console.error(`Angular 2+ module "${entryPoint}" load fail`, e);
  }
  return result;
};

export const registerMicrofrontendPlugins = async (pluginsDefinitions: string[], injector: Injector): Promise<void> => {
  if (pluginsDefinitions.length === 0) {
    return;
  }

  const loadModules = pluginsDefinitions.map((def) => loadModule(def));
  const pluginCtxs = (await Promise.all(loadModules)).filter((x) => !!x) as PluginCtx[];

  const compileModules = pluginCtxs.map((ctx) => compileModule(ctx.entryPoint, ctx.declaration.PluginModule, injector));
  const modules = (await Promise.all(compileModules)).filter((x) => !!x) as CompiledModule[];

  await registerCompiledModules(modules);
};
