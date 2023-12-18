import { createNgModule, Injector, Type } from '@angular/core';
import { PluginOnInit } from '@exense/step-core';

export interface CompiledModule {
  moduleClass: Type<any>;
  moduleInstance: any;
}

export const compileModule = (name: string, module: Type<any>, injector: Injector): CompiledModule | undefined => {
  try {
    const moduleRef = createNgModule(module, injector);
    return {
      moduleClass: module,
      moduleInstance: moduleRef.instance,
    };
  } catch (e) {
    console.error(`Angular 2+ module "${name}" compilation fail`, e);
    return undefined;
  }
};

export const registerCompiledModules = (modules: CompiledModule[]): Promise<void> | void => {
  if (!modules.length) {
    return;
  }

  const modulesWithInit = modules
    .map((m) => m.moduleInstance as Partial<PluginOnInit>)
    .filter((m) => !!m.pluginOnInit) as PluginOnInit[];

  if (modulesWithInit.length > 0) {
    return Promise.all(modulesWithInit.map((m) => m.pluginOnInit())).then();
  }
};
