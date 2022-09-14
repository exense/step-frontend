const fs = require('fs/promises');

const STRING_CAMELIZE_REGEXP = /(-|_|\.|\s)+(.)?/g;

const iconsSvgFolders = [
  'node_modules/feather-icons/dist/icons',
  '../node_modules/feather-icons/dist/icons'
];

const prefixPath = 'projects/step-core/src/lib/modules/step-icons';
const iconsDestFolder = `${prefixPath}/icons/svg`;
const indexFile = `${prefixPath}/icons/index.ts`;
const allFile = `${prefixPath}/icons/all.ts`;
const templateFile = `${prefixPath}/templates/icon-template.ts.tpl`;

const camelize = str => str
    .replace(STRING_CAMELIZE_REGEXP, (_match, _separator, chr) => {
      return chr ? chr.toUpperCase() : '';
    })
    .replace(/^([A-Z])/, (match) => match.toLowerCase());

const upperCamelize = str => {
  const camelCase = camelize(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

const isFileExists = async (path) => {
  let isExists;
  try {
    await fs.access(path);
    isExists = true;
  } catch {
    isExists = false;
  }
  return {path, isExists};
}

const getExistedFolders = async () => {
  const folders = await Promise.all(iconsSvgFolders.map(path => isFileExists(path)));
  return folders
    .filter(f => f.isExists)
    .map(f => f.path);
}

const removeExtension = name => name.substr(0, name.lastIndexOf('.'));

const run = async () => {
  let exportAllString = `\nexport const allIcons = {\n`;
  const iconTemplate = await fs.readFile(templateFile, {encoding: 'utf-8'});

  await fs.rm(iconsDestFolder, {force: true, recursive: true});
  await fs.rm(indexFile, {force: true});
  await fs.rm(allFile, {force: true});

  await fs.mkdir(iconsDestFolder);

  const proceedFile = async (folder, file) => {
    const iconName = removeExtension(file);
    const exportName = upperCamelize(iconName);

    const markup = await fs.readFile(`${folder}/${file}`, {encoding: 'utf-8'});
    const payload = String(markup).match(/^<svg[^>]+?>(.+)<\/svg>$/);

    const output = iconTemplate
      .replace(/__EXPORT_NAME__/g, exportName)
      .replace(/__ICON_NAME__/g, iconName)
      .replace(/__PAYLOAD__/, payload[1]);

    await fs.writeFile(`${iconsDestFolder}/${iconName}.ts`, output, {encoding: 'utf-8'});
    await fs.appendFile(indexFile, `export { ${exportName} } from './svg/${iconName}';\n`);
    await fs.appendFile(allFile, `import { ${exportName} } from './svg/${iconName}';\n`);

    exportAllString += `  ${exportName}, \n`;
  }

  const proceedFolder = async (folder) => {
    const files = await fs.readdir(folder);
    const filePromises = files.map(file => proceedFile(folder, file));
    return Promise.all(filePromises);
  };

  const folders = await getExistedFolders();
  await Promise.all(folders.map(f => proceedFolder(f)));

  exportAllString += `};\n`;

  await fs.appendFile(allFile, exportAllString);
  await fs.appendFile(indexFile, `\nexport { allIcons } from './all';\n`)
};

return run().catch(err => console.error(err));

