import { LegacyPluginDefinition } from './shared/legacy-plugin-definition';

const loadScript = (fileName: string): Promise<unknown> =>
  new Promise<unknown>((resolve, reject) => {
    const callbackSuccess = () => {
      console.log(`Loaded plugin script ${fileName}`);
      resolve(true);
    };
    const callbackError = (err: any) => reject(err);
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', fileName + '?v=${project.version}');
    //@ts-ignore
    script.onreadystatechange = callbackSuccess;
    script.onload = callbackSuccess;
    script.onerror = callbackError;
    document.querySelector('head')!.appendChild(script);
  });

const loadSinglePlugin = async (pluginDefinition: LegacyPluginDefinition): Promise<string[]> => {
  try {
    for (const script of pluginDefinition.scripts) {
      await loadScript(script);
    }
    //await Promise.all(scriptsLoad);
  } catch (e) {
    console.error(`Module(s) ${pluginDefinition.angularModules.join(', ')} load fail`, e);
    return [];
  }
  return pluginDefinition.angularModules;
};

export const registerLegacyPlugins = async (pluginDefinitions: LegacyPluginDefinition[]) => {
  return;
};
