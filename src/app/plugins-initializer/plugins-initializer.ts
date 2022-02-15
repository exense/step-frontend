import { APP_INITIALIZER, Compiler, FactoryProvider, Injector } from '@angular/core';
import { LegacyPluginDefinition } from './shared/legacy-plugin-definition';
import { MicrofrontendPluginDefinition } from './shared/microfrontend-plugin-definition';
import { registerLegacyPlugins } from './register-legacy-plugins';
import { registerMicrofrontendPlugins } from './register-microfrontend-plugins';

// TODO: modify in BE and remove override
const OVERRIDE_PLUGINS = new Map<string, string>([['multitenancy', 'multitenancy/remoteEntry.js']]);

export type PluginDefinition = LegacyPluginDefinition | MicrofrontendPluginDefinition;

const fetchDefinitions = async (): Promise<PluginDefinition[]> => {
  let result: PluginDefinition[] = [];
  try {
    const pluginsResponse = await fetch('/rest/app/plugins');

    result = ((await pluginsResponse.json()) as PluginDefinition[]).map((plugin) => {
      const angularModules = (plugin as LegacyPluginDefinition)?.angularModules || [];
      const toOverride = angularModules.find((m) => OVERRIDE_PLUGINS.has(m));
      if (toOverride) {
        const entryPoint = OVERRIDE_PLUGINS.get(toOverride)!;
        console.log(`Plugin "${toOverride}" configuration was overridden to the new format`);
        return { entryPoint };
      }

      return plugin;
    });
  } catch (e) {
    console.log('Fetch plugin definitions failed', e);
  }
  return result;
};

const loadPlugins = (compiler: Compiler, injector: Injector) => {
  return async () => {
    const pluginDefinitions = await fetchDefinitions();
    if (pluginDefinitions.length === 0) {
      return;
    }

    const { legacy, microfrontend } = pluginDefinitions.reduce(
      (res, plugin) => {
        if (plugin.hasOwnProperty('entryPoint')) {
          res.microfrontend.push(plugin as MicrofrontendPluginDefinition);
        } else {
          res.legacy.push(plugin as LegacyPluginDefinition);
        }
        return res;
      },
      {
        legacy: [] as LegacyPluginDefinition[],
        microfrontend: [] as MicrofrontendPluginDefinition[],
      }
    );

    await Promise.all([
      registerLegacyPlugins(legacy),
      registerMicrofrontendPlugins(microfrontend, { compiler, injector }),
    ]);
  };
};

export const PLUGINS_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: loadPlugins,
  deps: [Compiler, Injector],
  multi: true,
};
