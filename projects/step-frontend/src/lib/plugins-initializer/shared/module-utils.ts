import { Compiler, Injector, Type } from '@angular/core';
import { AJS_MODULE, getPluginMetaInfo, PluginOnInit } from '@exense/step-core';
import { getAngularJSGlobal } from '@angular/upgrade/static';

export interface CompileCtx {
  compiler: Compiler;
  injector: Injector;
}

export interface CompiledModule {
  moduleClass: Type<any>;
  moduleInstance: any;
}

export const compileModule = async (
  name: string,
  module: Type<any>,
  { compiler, injector }: CompileCtx
): Promise<CompiledModule | undefined> => {
  try {
    const moduleFactory = await compiler.compileModuleAsync(module);
    const moduleRef = moduleFactory.create(injector);
    return {
      moduleClass: module,
      moduleInstance: moduleRef.instance,
    };
  } catch (e) {
    console.error(`Angular 2+ module "${name}" compilation fail`, e);
    return undefined;
  }
};

export const registerCompiledModules = async (modules: CompiledModule[]): Promise<void> => {
  if (!modules.length) {
    return;
  }

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
};
