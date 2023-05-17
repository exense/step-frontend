import { PluginOnInit } from './plugin-on-init';
import { Compiler, inject, Injector, Type } from '@angular/core';
import { PluginInfoRegistryService } from '../services/plugin-info-registry.service';
import { IModule } from 'angular';

export interface LazyLoadPluginMeta {
  Module: Type<any>;
  ajsModuleName?: string;
}

export type ImportMeta =
  | (() => Promise<LazyLoadPluginMeta>)
  | {
      load: () => Promise<LazyLoadPluginMeta>;
      isForceLoad?: boolean;
    };

export abstract class PluginLazyLoad implements PluginOnInit {
  private _compiler = inject(Compiler);
  private _injector = inject(Injector);
  private _pluginInfoRegistry = inject(PluginInfoRegistryService);

  constructor(private parentAjsModule?: IModule) {}

  pluginOnInit(): Promise<unknown> {
    const metaDictionary = this.getPluginsLazyLoadMeta();
    const registrations = Object.entries(metaDictionary)
      .map(([pluginName, importMetas]) => {
        return importMetas.map((importMeta) => {
          const { load, isForceLoad } =
            typeof importMeta === 'object' ? importMeta : { load: importMeta, isForceLoad: false };

          return { pluginName, load, isForceLoad };
        });
      })
      .flat()
      .filter(({ pluginName, isForceLoad }) => isForceLoad || this._pluginInfoRegistry.isRegistered(pluginName))
      .map(({ pluginName, load }) => this.registerPlugin(pluginName, load));

    return Promise.all(registrations);
  }

  protected abstract getPluginsLazyLoadMeta(): Record<string, ImportMeta[]>;

  private registerPlugin(pluginName: string, load: () => Promise<LazyLoadPluginMeta>): Promise<void> {
    console.log(`PLUGIN "${pluginName}" LAZYLOAD`);
    return load()
      .then((meta) => {
        if (meta.ajsModuleName && this.parentAjsModule) {
          this.parentAjsModule.requires.push(meta.ajsModuleName);
        }
        return this._compiler.compileModuleAsync(meta.Module);
      })
      .then((moduleFactory) => moduleFactory.create(this._injector))
      .then(() => console.log(`MODULE "${pluginName}" REGISTERED`));
  }
}
