const fs = require('fs/promises');

const STRING_CAMELIZE_REGEXP = /(-|_|\.|\s)+(.)?/g;
const PAYLOAD_REGEXP = /^<svg[^>]+?>((.|\n)+)<\/svg>$/;
const VIEWBOX_REGEXP = /viewBox="(.+?)"/;

const iconsSvgFolders = [
  'node_modules/feather-icons/dist/icons',
  '../node_modules/feather-icons/dist/icons',
  'custom-icons',
];

const prefixPath = 'projects/step-core/src/lib/modules/step-icons';
const iconsDestFolder = `${prefixPath}/icons/svg`;
const indexFile = `${prefixPath}/icons/index.ts`;
const allFile = `${prefixPath}/icons/all.ts`;
const templateFile = `${prefixPath}/templates/icon-template.ts.tpl`;

const camelize = (str) =>
  str
    .replace(STRING_CAMELIZE_REGEXP, (_match, _separator, chr) => {
      return chr ? chr.toUpperCase() : '';
    })
    .replace(/^([A-Z])/, (match) => match.toLowerCase());

const upperCamelize = (str) => {
  const camelCase = camelize(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

const isFileExisting = async (path) => {
  let isExisting;
  try {
    await fs.access(path);
    isExisting = true;
  } catch {
    isExisting = false;
  }
  return { path, isExisting };
};

const getExistingFolders = async () => {
  const folders = await Promise.all(iconsSvgFolders.map((path) => isFileExisting(path)));
  return folders.filter((f) => f.isExisting).map((f) => f.path);
};

const removeExtension = (name) => name.substr(0, name.lastIndexOf('.'));

const run = async () => {
  let exportAllString = `\nexport const allIcons = {\n`;
  const iconTemplate = await fs.readFile(templateFile, { encoding: 'utf-8' });

  await fs.rm(iconsDestFolder, { force: true, recursive: true });
  await fs.rm(indexFile, { force: true });
  await fs.rm(allFile, { force: true });

  await fs.mkdir(iconsDestFolder);

  const proceedFile = async (folder, file) => {
    const iconName = removeExtension(file);
    const exportName = upperCamelize(iconName);

    const markup = await fs.readFile(`${folder}/${file}`, { encoding: 'utf-8' });
    const markupContent = String(markup).trim();
    const payload = markupContent.match(PAYLOAD_REGEXP)[1];

    if (!payload) {
      console.log('FAILED TO EXTRACT SVG FROM:', `${folder}/${file}`);
      console.log('MARKUP', markup.trim());
      console.log('---------------------------------');
      return;
    }

    let viewBox = '0 0 24 24';
    if (VIEWBOX_REGEXP.test(markupContent)) {
      viewBox = markupContent.match(VIEWBOX_REGEXP)[1];
    }

    const output = iconTemplate
      .replace(/__EXPORT_NAME__/g, exportName)
      .replace(/__ICON_NAME__/g, iconName)
      .replace(/__VIEW_BOX__/g, viewBox)
      .replace(/__PAYLOAD__/, payload);

    await fs.writeFile(`${iconsDestFolder}/${iconName}.ts`, output, { encoding: 'utf-8' });
    await fs.appendFile(indexFile, `export { ${exportName} } from './svg/${iconName}';\n`);
    await fs.appendFile(allFile, `import { ${exportName} } from './svg/${iconName}';\n`);

    exportAllString += `  ${exportName}, \n`;
  };

  const proceedFolder = async (folder) => {
    const files = await fs.readdir(folder);
    const filePromises = files.map((file) => proceedFile(folder, file));
    return Promise.all(filePromises);
  };

  const folders = await getExistingFolders();
  await Promise.all(folders.map((f) => proceedFolder(f)));

  exportAllString += `};\n`;

  await fs.appendFile(allFile, exportAllString);
  await fs.appendFile(indexFile, `\nexport { allIcons } from './all';\n`);
};

return run().catch((err) => console.error(err));
