import { A1PluginDefinition } from './shared/a1-plugin-definition';
import { getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../modules/base/shared/constants';

const loadScript = (fileName: string): Promise<unknown> =>
  new Promise<unknown>((resolve, reject) => {
    const callbackSuccess = () => {
      console.log(`Loaded plugin script ${fileName}`);
      resolve(true);
    };
    const callbackError = (err: any) => reject(err);
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', fileName);
    //@ts-ignore
    script.onreadystatechange = callbackSuccess;
    script.onload = callbackSuccess;
    script.onerror = callbackError;
    document.querySelector('head')!.appendChild(script);
  });

const loadSinglePlugin = async (pluginDefinition: A1PluginDefinition): Promise<string[]> => {
  try {
    const scriptsLoad = pluginDefinition.scripts.map((script) => loadScript(script));
    await Promise.all(scriptsLoad);
  } catch (e) {
    console.error(`Module(s) ${pluginDefinition.angularModules.join(', ')} load fail`, e);
    return [];
  }
  return pluginDefinition.angularModules;
};

export const registerA1Plugins = async (pluginDefinitions: A1PluginDefinition[]) => {
  if (pluginDefinitions.length === 0) {
    return;
  }
  console.log('Load plugins');
  const pluginsLoad = pluginDefinitions.map((def) => loadSinglePlugin(def));
  const angularModules = (await Promise.all(pluginsLoad)).reduce((res, item) => [...res, ...item], []);
  console.log('Plugins script created');

  getAngularJSGlobal()
    .module(AJS_MODULE)
    .requires.push(...angularModules);
  console.log('angularJS plugins added');
};
