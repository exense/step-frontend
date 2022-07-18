import { loadRemoteModule, LoadRemoteModuleOptions } from '@angular-architects/module-federation';
import { Compiler, Injector, Type } from '@angular/core';
import { MicrofrontendPluginDefinition } from './shared/microfrontend-plugin-definition';
import { AJS_MODULE, getPluginMetaInfo, PluginOnInit } from '@exense/step-core';
import { getAngularJSGlobal } from '@angular/upgrade/static';

interface PluginModuleDeclaration {
  PluginModule: Type<any>;
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

const compileModule = async ({ compiler, injector, declaration, definition }: CompileCtx & PluginCtx): Promise<any> => {
  try {
    const moduleFactory = await compiler.compileModuleAsync(declaration.PluginModule);
    const moduleRef = moduleFactory.create(injector);
    return {
      moduleClass: declaration.PluginModule,
      moduleInstance: moduleRef.instance,
    };
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
  const modules = (await Promise.all(compileModules)).filter((x) => !!x);

  const modulesWithInit = modules
    .map((m) => m.moduleInstance as Partial<PluginOnInit>)
    .filter((m) => !!m.pluginOnInit) as PluginOnInit[];

  if (modulesWithInit.length > 0) {
    await Promise.all(modulesWithInit.map((m) => m.pluginOnInit()));
  }

  const hybridModules = modules
    .map((module) => getPluginMetaInfo(module.moduleClass)?.hybridModuleName)
    .filter((x) => !!x);

  if (hybridModules.length > 0) {
    const hostModule = getAngularJSGlobal().module(AJS_MODULE);
    hostModule.requires.push(...hybridModules);
  }

  return undefined;
};
