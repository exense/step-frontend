import { APP_INITIALIZER, FactoryProvider, inject, Injector } from '@angular/core';
import { MicrofrontendPluginDefinition } from './shared/microfrontend-plugin-definition';
import { registerMicrofrontendPlugins } from './register-microfrontend-plugins';
import { GLOBAL_INDICATOR, PluginInfoRegistryService } from '@exense/step-core';
import { registerOsPlugins } from './register-os-plugins';
import { DOCUMENT } from '@angular/common';

// For testing purposes only
// Allows to add plugins that aren't enabled in the BE
const ADDITIONAL_PLUGINS: ReadonlyArray<MicrofrontendPluginDefinition> = [
  // Add object like this {name: 'pluginName', entryPoint: 'pluginName/remoteEntry.js' }
];

// The entry point name for the OS plugins.
// Should be ignored during the registration
const DEFAULT_ENTRY_POINT = 'default';

const fetchDefinitions = async (addProjectVersion: boolean): Promise<MicrofrontendPluginDefinition[]> => {
  let result: MicrofrontendPluginDefinition[] = [];
  try {
    const pluginsResponse = await fetch('rest/app/plugins');

    result = ((await pluginsResponse.json()) as MicrofrontendPluginDefinition[]).map((plugin) => {
      console.log('received plugins', plugin);

      if (plugin.entryPoint && plugin.entryPoint !== DEFAULT_ENTRY_POINT) {
        let entryPoint = plugin.entryPoint;
        if (entryPoint.endsWith('.js')) {
          entryPoint = entryPoint.replace('.js', '.json');
        }
        if (addProjectVersion) {
          entryPoint += '?v=${project.version}';
        }
        plugin.entryPoint = entryPoint;
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
  const globalIndicator = inject(GLOBAL_INDICATOR);
  const document = inject(DOCUMENT);

  const hostName = document?.defaultView?.location?.host;
  const addProjectVersion = !hostName || !hostName.startsWith('localhost');

  globalIndicator.showMessage('Loading plugins...');
  return async () => {
    const pluginDefinitions = await fetchDefinitions(addProjectVersion);
    if (pluginDefinitions.length === 0) {
      return;
    }

    const pluginNames: string[] = [];
    const entryPoints = new Set<string>();

    pluginDefinitions.forEach((plugin) => {
      pluginNames.push(plugin.name);
      if (plugin.entryPoint !== DEFAULT_ENTRY_POINT) {
        entryPoints.add(plugin.entryPoint);
      }
    });

    registry.register(...pluginNames);

    globalIndicator.showMessage('Initializing plugins...');
    await Promise.all([
      registerMicrofrontendPlugins(Array.from(entryPoints), injector),
      registerOsPlugins(injector),
    ]).then(() => {
      globalIndicator.showMessage('Starting Step...');
    });
  };
};

export const PLUGINS_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: registerPlugins,
  multi: true,
};
