const shell = require('shelljs');

const copyPluginFiles = (pluginName) => {
  shell.cp('-R', `./schematics/${pluginName}/files/`, `../../dist/step-core/schematics/${pluginName}/`);
  shell.cp(`./schematics/${pluginName}/schema.json`, `../../dist/step-core/schematics/${pluginName}/schema.json`);
};

copyPluginFiles('plugin-common');
copyPluginFiles('plugin-wrapper');
shell.cp('./schematics/collection.json', '../../dist/step-core/schematics/collection.json');
