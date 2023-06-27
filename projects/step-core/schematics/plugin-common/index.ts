import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { join, normalize, strings } from '@angular-devkit/core';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { camelize } from '@angular-devkit/core/src/utils/strings';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { Schema } from '../shared/schema';
import { createNames, Names } from '../shared/create-names';

const CURRENT_VERSION = '0.0.1';

interface InnerOptions {
  names: Names;
  projectRoot: string;
}

async function getProjectRoot(host: Tree): Promise<string> {
  const workspace = await getWorkspace(host);
  return workspace.extensions['newProjectRoot'] as string;
}

function createPluginFiles({ names, projectRoot }: InnerOptions): Rule {
  return () => {
    const srcApp = join(normalize(projectRoot), names.folderName, 'src');

    const templateSource = apply(url('./files/src'), [
      applyTemplates({
        ...strings,
        ...names,
      }),
      move(srcApp),
    ]);

    return mergeWith(templateSource, MergeStrategy.Overwrite);
  };
}

function makeMainAsync({ names, projectRoot }: InnerOptions): Rule {
  return (tree: Tree) => {
    const srcRoot = join(normalize(projectRoot), names.folderName, 'src');
    const main = join(srcRoot, 'main.ts');
    const bootstrap = join(srcRoot, 'bootstrap.ts');
    const mainContent = tree.read(main)!.toString();
    tree.overwrite(bootstrap, mainContent);
    tree.overwrite(main, "import('./bootstrap')\n\t.catch(err => console.error(err));\n");
  };
}

function overrideConfigs({ names, projectRoot }: InnerOptions): Rule {
  return () => {
    const pluginRoot = join(normalize(projectRoot), names.folderName);

    const configSource = apply(url('./files/configs'), [
      applyTemplates({
        ...strings,
        ...names,
        version: CURRENT_VERSION,
      }),
      move(pluginRoot),
    ]);

    return mergeWith(configSource, MergeStrategy.Overwrite);
  };
}

function modifyPackageJson({ names }: InnerOptions): Rule {
  return (host: Tree) => {
    const packageJson = new JSONFile(host, '/package.json');

    //Add command to build plugin
    const pluginName = camelize(names.pluginName);
    const commandPath = ['scripts', `build:a2:${pluginName}`];
    if (!packageJson.get(commandPath)) {
      packageJson.modify(commandPath, `ng build ${pluginName}`);
    }

    //Remove federation command, that serves all microfrontend apps locally
    const serveAllPath = ['scripts', 'run:all'];
    if (!!packageJson.get(serveAllPath)) {
      packageJson.remove(serveAllPath);
    }

    return host;
  };
}

export default function createPlugin(options: Schema): Rule {
  const { prefix, port } = options;
  return async (host: Tree, _context: SchematicContext) => {
    const names = createNames(options);
    const projectRoot = await getProjectRoot(host);

    _context.logger.info(`Plugin schematic invoke ${names.pluginName}`);

    const innerOptions = {
      names,
      projectRoot,
    };

    const appRule = externalSchematic('@schematics/angular', 'application', {
      name: names.pluginName,
      prefix,
      routing: false,
      skipInstall: true,
    });

    const federationRule = externalSchematic('@angular-architects/module-federation', 'config', {
      project: names.pluginName,
      port,
    });

    const pluginFiles = createPluginFiles(innerOptions);
    const configFiles = overrideConfigs(innerOptions);
    const packageJsonFile = modifyPackageJson(innerOptions);
    const fixMain = makeMainAsync(innerOptions);

    return chain([appRule, pluginFiles, federationRule, configFiles, packageJsonFile, fixMain]);
  };
}
