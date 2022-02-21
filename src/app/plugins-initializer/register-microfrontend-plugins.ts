import { loadRemoteModule, LoadRemoteModuleOptions } from '@angular-architects/module-federation';
import { Compiler, Injector, Type } from '@angular/core';
import { MicrofrontendPluginDefinition } from './shared/microfrontend-plugin-definition';
import { AJS_MODULE } from '@exense/step-core';

abstract class PluginModule {
  abstract registerPluginDependency(hostName: string): void;
}

interface PluginModuleDeclaration {
  PluginModule: Type<PluginModule>;
}

export interface CompileCtx {
  compiler: Compiler;
  injector: Injector;
}

export interface PluginCtx {
  definition: MicrofrontendPluginDefinition;
  declaration: PluginModuleDeclaration;
}

const loadModule = async (definition: MicrofrontendPluginDefinition): Promise<PluginCtx | undefined> => {
  let result: PluginCtx | undefined = undefined;
  try {
    const remoteEntry = definition.entryPoint.startsWith('/') ? definition.entryPoint : `/${definition.entryPoint}`;

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

const compileModule = async ({
  compiler,
  injector,
  declaration,
  definition,
}: CompileCtx & PluginCtx): Promise<PluginModule | undefined> => {
  try {
    const moduleFactory = await compiler.compileModuleAsync(declaration.PluginModule);
    const moduleRef = moduleFactory.create(injector);
    return moduleRef.instance;
  } catch (e) {
    console.error(`Angular 2+ module "${definition.entryPoint}" compilation fail`, e);
    return undefined;
  }
};

export const registerMicrofrontendPlugins = async (
  pluginsDefinitions: MicrofrontendPluginDefinition[],
  compileCtx: CompileCtx
): Promise<unknown> => {
  if (pluginsDefinitions.length === 0) {
    return undefined;
  }

  const loadModules = pluginsDefinitions.map((def) => loadModule(def));
  const pluginCtxs = (await Promise.all(loadModules)).filter((x) => !!x) as PluginCtx[];

  const compileModules = pluginCtxs.map((ctx) => compileModule({ ...compileCtx, ...ctx }));
  const modules = (await Promise.all(compileModules)).filter((x) => !!x) as PluginModule[];

  modules.forEach((m) => m.registerPluginDependency(AJS_MODULE));
  return undefined;
};
