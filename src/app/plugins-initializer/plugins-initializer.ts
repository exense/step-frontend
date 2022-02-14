import { APP_INITIALIZER, Compiler, FactoryProvider, Injector } from '@angular/core';
import { A1PluginDefinition } from './shared/a1-plugin-definition';
import { A2PluginDefinition } from './shared/a2-plugin-definition';
import { registerA1Plugins } from './register-a1-plugins';
import { registerA2Plugins } from './register-a2-plugins';

const OVERRIDE_PLUGINS = new Map<string, string>([['multitenancy', 'multitenancy/remoteEntry.js']]);

export type PluginDefinition = A1PluginDefinition | A2PluginDefinition;

const fetchDefinitions = async (): Promise<PluginDefinition[]> => {
  let result: PluginDefinition[] = [];
  try {
    const pluginsResponse = await fetch('/rest/app/plugins');

    result = ((await pluginsResponse.json()) as PluginDefinition[]).map((plugin) => {
      const angularModules = (plugin as A1PluginDefinition)?.angularModules || [];
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

    const { a1Plugins, a2Plugins } = pluginDefinitions.reduce(
      (res, plugin) => {
        if (plugin.hasOwnProperty('entryPoint')) {
          res.a2Plugins.push(plugin as A2PluginDefinition);
        } else {
          res.a1Plugins.push(plugin as A1PluginDefinition);
        }
        return res;
      },
      {
        a1Plugins: [] as A1PluginDefinition[],
        a2Plugins: [] as A2PluginDefinition[],
      }
    );

    await Promise.all([registerA1Plugins(a1Plugins), registerA2Plugins(a2Plugins, { compiler, injector })]);
  };
};

export const PLUGINS_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: loadPlugins,
  deps: [Compiler, Injector],
  multi: true,
};
