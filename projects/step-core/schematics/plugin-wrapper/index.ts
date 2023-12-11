import {
  applyToSubtree,
  chain,
  externalSchematic,
  Rule,
  Tree,
  apply,
  applyTemplates,
  MergeStrategy,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';
import { Schema } from '../shared/schema';
import { createNames, Names } from '../shared/create-names';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { join, normalize, strings } from '@angular-devkit/core';

const STEP_FRONTEND = 'step-frontend';
const STEP_EE_FRONTEND = 'step-enterprise-frontend';
const ANGULAR_JSON = 'angular.json';

function isInvokedFromWorkspace(host: Tree): boolean {
  return (
    host.exists(join(normalize(STEP_FRONTEND), ANGULAR_JSON)) &&
    host.exists(join(normalize(STEP_EE_FRONTEND), ANGULAR_JSON))
  );
}

function moveAngularJsonChangesToWorkspace(names: Names): Rule {
  return (host: Tree) => {
    const eeAngularJson = new JSONFile(host, join(normalize(STEP_EE_FRONTEND), ANGULAR_JSON));

    const projectConfig = eeAngularJson.get(['projects', names.pluginName]);
    if (!projectConfig) {
      console.log(`There is no configuration for ${names.pluginName}`);
      return;
    }

    let projectConfigStr = JSON.stringify(projectConfig);

    // @ts-ignore
    projectConfigStr = projectConfigStr.replaceAll(
      `plugins/${names.folderName}`,
      `${STEP_EE_FRONTEND}/plugins/${names.folderName}`
    );

    // @ts-ignore
    projectConfigStr = projectConfigStr.replaceAll('webpack.config.js', 'webpack.ws.config.js');

    // @ts-ignore
    projectConfigStr = projectConfigStr.replaceAll('webpack.prod.config.js', 'webpack.ws.config.js');

    const wsAngularJson = new JSONFile(host, ANGULAR_JSON);
    wsAngularJson.modify(['projects', names.pluginName], JSON.parse(projectConfigStr));
    wsAngularJson.modify(
      ['projects', names.pluginName, 'architect', 'build', 'options', 'tsConfig'],
      `tsconfig.${strings.dasherize(names.pluginName)}.json`
    );
  };
}

function addAdditionalWorkspaceConfigs(names: Names): Rule {
  return () => {
    const wsRoot = normalize('.');
    const pluginRoot = join(wsRoot, STEP_EE_FRONTEND, 'plugins', names.folderName);

    const pluginConfig = apply(url('./files/plugin-config'), [
      applyTemplates({
        ...strings,
        ...names,
      }),
      move(pluginRoot),
    ]);

    const wsConfig = apply(url('./files/ws-config'), [
      applyTemplates({
        ...strings,
        ...names,
      }),
      move(wsRoot),
    ]);

    return chain([mergeWith(pluginConfig, MergeStrategy.Overwrite), mergeWith(wsConfig, MergeStrategy.Overwrite)]);
  };
}

function modifyPackageJson({ pluginName }: Names): Rule {
  return (host: Tree) => {
    const packageJson = new JSONFile(host, '/package.json');
    const commandPath = ['scripts', `serve:plugin:${pluginName}`];
    if (!packageJson.get(commandPath)) {
      packageJson.modify(commandPath, `ng serve ${pluginName}`);
    }
  };
}

function modifyProxyConfig(names: Names, port: number): Rule {
  return (host: Tree) => {
    const proxyEEConfig = new JSONFile(host, '/proxy-ee.conf.json');
    const proxyConf = {
      target: `http://localhost:${port}`,
      pathRewrite: {} as { [key: string]: string },
    };
    proxyConf.pathRewrite[`^/${names.folderName}`] = '';
    proxyEEConfig.modify([`/${names.folderName}`], proxyConf);
  };
}

export default function createPlugin(options: Schema): Rule {
  return (host: Tree) => {
    const plugin = externalSchematic('@exense/step-core', 'plugin-common', options);

    if (!isInvokedFromWorkspace(host)) {
      return plugin;
    }

    const names = createNames(options);

    const pluginToSubtree = applyToSubtree(STEP_EE_FRONTEND, [plugin]);
    const angularJsonChanges = moveAngularJsonChangesToWorkspace(names);
    const workspaceConfigs = addAdditionalWorkspaceConfigs(names);
    const packageJsonFile = modifyPackageJson(names);
    const proxyConfig = modifyProxyConfig(
      names,
      typeof options.port === 'number' ? options.port : parseInt(options.port)
    );

    return chain([pluginToSubtree, angularJsonChanges, workspaceConfigs, packageJsonFile, proxyConfig]);
  };
}
