import { PluginOnInit } from './plugin-on-init';
import { createNgModule, inject, Injector, Type } from '@angular/core';
import { PluginInfoRegistryService } from '../services/plugin-info-registry.service';
import { LAZY_LOAD_INTERCEPTORS } from '../client/step-client-module';

export interface LazyLoadPluginMeta {
  Module: Type<any>;
}

export type ImportMeta =
  | (() => Promise<LazyLoadPluginMeta>)
  | {
      load: () => Promise<LazyLoadPluginMeta>;
      isForceLoad?: boolean;
    };

export abstract class PluginLazyLoad implements PluginOnInit {
  private _injector = inject(Injector);
  private _pluginInfoRegistry = inject(PluginInfoRegistryService);

  pluginOnInit(): Promise<unknown> {
    const metaDictionary = this.getPluginsLazyLoadMeta();
    const registrations = Object.entries(metaDictionary)
      .map(([pluginName, importMeta]) => {
        const { load, isForceLoad } =
          typeof importMeta === 'object' ? importMeta : { load: importMeta, isForceLoad: false };
        return { pluginName, load, isForceLoad };
      })
      .filter(({ pluginName, isForceLoad }) => isForceLoad || this._pluginInfoRegistry.isRegistered(pluginName))
      .map(({ pluginName, load }) => this.registerPlugin(pluginName, load));

    return Promise.all(registrations);
  }

  protected abstract getPluginsLazyLoadMeta(): Record<string, ImportMeta>;

  private registerPlugin(pluginName: string, load: () => Promise<LazyLoadPluginMeta>): Promise<void> {
    console.log(`PLUGIN "${pluginName}" LAZYLOAD`);
    return load()
      .then((meta) => createNgModule(meta.Module, this._injector))
      .then((module) => {
        // Inject module's interceptors to register them
        const interceptors = module.injector.get(LAZY_LOAD_INTERCEPTORS, null, { optional: true });
        console.log(`MODULE "${pluginName}" REGISTERED`);
      });
  }
}
