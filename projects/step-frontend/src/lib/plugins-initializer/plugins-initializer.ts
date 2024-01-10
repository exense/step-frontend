import { APP_INITIALIZER, FactoryProvider, inject, Injector } from '@angular/core';
import { MicrofrontendPluginDefinition } from './shared/microfrontend-plugin-definition';
import { registerMicrofrontendPlugins } from './register-microfrontend-plugins';
import { PluginInfoRegistryService } from '@exense/step-core';
import { registerOsPlugins } from './register-os-plugins';

// For testing purposes only
// Allows to add plugins that aren't enabled in the BE
const ADDITIONAL_PLUGINS: ReadonlyArray<MicrofrontendPluginDefinition> = [
  // Add object like this {name: 'pluginName', entryPoint: 'pluginName/remoteEntry.js' }
];

export type PluginDefinition = MicrofrontendPluginDefinition;

const fetchDefinitions = async (): Promise<PluginDefinition[]> => {
  let result: PluginDefinition[] = [];
  try {
    const pluginsResponse = await fetch('rest/app/plugins');

    result = ((await pluginsResponse.json()) as PluginDefinition[]).map((plugin) => {
      console.log('received plugins', plugin);

      if (plugin['entryPoint']) {
        plugin['entryPoint'] += '?v=${project.version}';
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

const registerPlugins = () => {
  const injector = inject(Injector);
  const registry = inject(PluginInfoRegistryService);

  return async () => {
    const pluginDefinitions = await fetchDefinitions();
    if (pluginDefinitions.length === 0) {
      return;
    }

    let { microfrontend } = pluginDefinitions.reduce(
      (res, plugin) => {
        if (plugin.hasOwnProperty('entryPoint')) {
          res.microfrontend.push(plugin as MicrofrontendPluginDefinition);
        }
        return res;
      },
      {
        microfrontend: [] as MicrofrontendPluginDefinition[],
      }
    );

    const pluginNames = [...microfrontend.map((pluginInfo) => pluginInfo.name)];

    registry.register(...pluginNames);

    const entryPoints = new Set<string>();

    microfrontend.forEach((plugin) => {
      entryPoints.add(plugin.entryPoint);
    });

    await Promise.all([registerMicrofrontendPlugins(Array.from(entryPoints), injector), registerOsPlugins(injector)]);
  };
};

export const PLUGINS_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: registerPlugins,
  multi: true,
};
