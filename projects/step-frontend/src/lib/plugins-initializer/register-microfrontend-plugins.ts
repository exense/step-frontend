import { loadRemoteModule, LoadRemoteModuleOptions } from '@angular-architects/module-federation';
import { Injector, Type } from '@angular/core';
import { MicrofrontendPluginDefinition } from './shared/microfrontend-plugin-definition';
import { CompiledModule, compileModule, registerCompiledModules } from './shared/module-utils';

interface PluginModuleDeclaration {
  PluginModule: Type<any>;
}

export interface PluginCtx {
  definition: MicrofrontendPluginDefinition;
  declaration: PluginModuleDeclaration;
}

const loadModule = async (definition: MicrofrontendPluginDefinition): Promise<PluginCtx | undefined> => {
  let result: PluginCtx | undefined = undefined;
  try {
    let href = window.document.baseURI;
    if (!href.endsWith('/')) {
      href += '/';
    }

    const remoteEntry = href + definition.entryPoint;

    const options: LoadRemoteModuleOptions = {
      type: 'module',
      exposedModule: './Module',
      remoteEntry,
    };
    const declaration = await loadRemoteModule<PluginModuleDeclaration>(options);
    result = {
      definition,
      declaration,
    };
  } catch (e) {
    console.error(`Angular 2+ module "${definition.entryPoint}" load fail`, e);
  }
  return result;
};

export const registerMicrofrontendPlugins = async (
  pluginsDefinitions: MicrofrontendPluginDefinition[],
  injector: Injector
): Promise<void> => {
  if (pluginsDefinitions.length === 0) {
    return;
  }

  const loadModules = pluginsDefinitions.map((def) => loadModule(def));
  const pluginCtxs = (await Promise.all(loadModules)).filter((x) => !!x) as PluginCtx[];

  const compileModules = pluginCtxs.map((ctx) =>
    compileModule(ctx.definition.entryPoint, ctx.declaration.PluginModule, injector)
  );
  const modules = (await Promise.all(compileModules)).filter((x) => !!x) as CompiledModule[];

  await registerCompiledModules(modules);
};
