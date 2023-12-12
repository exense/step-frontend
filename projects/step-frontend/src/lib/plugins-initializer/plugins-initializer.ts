import { APP_INITIALIZER, Compiler, FactoryProvider, inject, Injector } from '@angular/core';
import { LegacyPluginDefinition } from './shared/legacy-plugin-definition';
import { MicrofrontendPluginDefinition } from './shared/microfrontend-plugin-definition';
import { registerMicrofrontendPlugins } from './register-microfrontend-plugins';
import { PluginInfoRegistryService } from '@exense/step-core';
import { registerOsPlugins } from './register-os-plugins';

const IGNORE_PLUGINS: ReadonlyArray<string> = [];

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
  const compiler = inject(Compiler);
  const injector = inject(Injector);
  const registry = inject(PluginInfoRegistryService);

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

    microfrontend = microfrontend.filter((m) => !IGNORE_PLUGINS.includes(m.name));

    await Promise.all([
      registerMicrofrontendPlugins(microfrontend, { compiler, injector }),
      registerOsPlugins({ compiler, injector }),
    ]);
  };
};

export const PLUGINS_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: registerPlugins,
  multi: true,
};
