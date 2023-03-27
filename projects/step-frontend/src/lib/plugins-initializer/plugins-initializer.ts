import { APP_INITIALIZER, Compiler, FactoryProvider, Injector } from '@angular/core';
import { LegacyPluginDefinition } from './shared/legacy-plugin-definition';
import { MicrofrontendPluginDefinition } from './shared/microfrontend-plugin-definition';
import { registerLegacyPlugins } from './register-legacy-plugins';
import { registerMicrofrontendPlugins } from './register-microfrontend-plugins';
import { PluginInfoRegistryService } from '@exense/step-core';

const OVERRIDE_PLUGINS = new Map<string, string>();

// Ignore original plugin since it's become part of enterprise core
const IGNORE_PLUGINS: ReadonlyArray<string> = [
  'multitenancy',
  'monitoringdashboard',
  'executionreport',
  'dualPlanEditor',
  'notifications',
  'planBrowser',
  'housekeeping',
  'menuConfig',
];

// For testing purposes only
// Allows to add plugins, that don't returned from BE
const ADDITIONAL_PLUGINS: ReadonlyArray<MicrofrontendPluginDefinition> = [
  // Add object like this {name: 'pluginName', entryPoint: 'pluginName/remoteEntry.js' }
];

export type PluginDefinition = LegacyPluginDefinition | MicrofrontendPluginDefinition;

const fetchDefinitions = async (): Promise<PluginDefinition[]> => {
  let result: PluginDefinition[] = [];
  try {
    const pluginsResponse = await fetch('rest/app/plugins');

    result = ((await pluginsResponse.json()) as PluginDefinition[]).map((plugin) => {
      console.log('received plugins', plugin);

      //@ts-ignore
      if (plugin['entryPoint']) {
        //@ts-ignore
        plugin['entryPoint'] += '?v=3.21.2';
      }

      const angularModules = (plugin as LegacyPluginDefinition)?.angularModules || [];
      const toOverride = angularModules.find((m) => OVERRIDE_PLUGINS.has(m));
      if (toOverride) {
        const name = toOverride;
        const entryPoint = OVERRIDE_PLUGINS.get(toOverride)!;
        console.log(`Plugin "${name}" configuration was overridden to the new format`);
        return { entryPoint, name };
      }

      return plugin;
    });

    if (ADDITIONAL_PLUGINS.length > 0) {
      result = [...result, ...ADDITIONAL_PLUGINS];
    }
  } catch (e) {
    console.log('Fetch plugin definitions failed', e);
  }
  return result;
};

const loadPlugins = (compiler: Compiler, injector: Injector, registry: PluginInfoRegistryService) => {
  return async () => {
    const pluginDefinitions = await fetchDefinitions();
    if (pluginDefinitions.length === 0) {
      return;
    }

    let { legacy, microfrontend } = pluginDefinitions.reduce(
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

    const pluginNames = [
      ...legacy.reduce((res, pluginInfo) => [...res, ...pluginInfo.angularModules], [] as string[]),
      ...microfrontend.map((pluginInfo) => pluginInfo.name),
    ];
    registry.register(...pluginNames);

    legacy = legacy.filter((l) => {
      const ignoredPlugins = IGNORE_PLUGINS.filter((name) => l.angularModules.includes(name));
      return ignoredPlugins.length === 0;
    });

    microfrontend = microfrontend.filter((m) => !IGNORE_PLUGINS.includes(m.name));

    await Promise.all([
      registerLegacyPlugins(legacy),
      registerMicrofrontendPlugins(microfrontend, { compiler, injector }),
    ]);
  };
};

export const PLUGINS_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: loadPlugins,
  deps: [Compiler, Injector, PluginInfoRegistryService],
  multi: true,
};
