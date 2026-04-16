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
  const iconTemplate = await fs.readFile(templateFile, { encoding: 'utf-8' });

  await fs.rm(iconsDestFolder, { force: true, recursive: true });
  await fs.rm(indexFile, { force: true });
  await fs.rm(allFile, { force: true });

  await fs.mkdir(iconsDestFolder);

  const proceedFile = async (folder, file) => {
    const iconName = removeExtension(file);
    const exportName = upperCamelize(iconName);

    const markup = await fs.readFile(`${folder}/${file}`, { encoding: 'utf-8' });
    const markupContent = String(markup)
      .trim()
      .replace(/^<\?xml[^?]*\?>\s*/i, '');
    const match = markupContent.match(PAYLOAD_REGEXP);

    if (!match) {
      console.log('FAILED TO EXTRACT SVG FROM:', `${folder}/${file}`);
      console.log('MARKUP', markup.trim());
      console.log('---------------------------------');
      return null;
    }

    const payload = match[1];
    let viewBox = '0 0 24 24';
    if (VIEWBOX_REGEXP.test(markupContent)) {
      viewBox = markupContent.match(VIEWBOX_REGEXP)[1];
    }

    const output = iconTemplate
      .replace(/__EXPORT_NAME__/g, exportName)
      .replace(/__ICON_NAME__/g, iconName)
      .replace(/__VIEW_BOX__/g, viewBox)
      .replace(/__PAYLOAD__/, payload);

    return { iconName, exportName, output };
  };

  const proceedFolder = async (folder) => {
    const files = await fs.readdir(folder);
    const results = await Promise.all(files.map((file) => proceedFile(folder, file)));
    return results.filter(Boolean);
  };

  const folders = await getExistingFolders();
  const perFolder = await Promise.all(folders.map((f) => proceedFolder(f)));
  const icons = perFolder.flat().sort((a, b) => a.exportName.localeCompare(b.exportName));

  await Promise.all(
    icons.map(({ iconName, output }) =>
      fs.writeFile(`${iconsDestFolder}/${iconName}.ts`, output, { encoding: 'utf-8' }),
    ),
  );

  const indexLines = icons.map(({ exportName, iconName }) => `export { ${exportName} } from './svg/${iconName}';`);
  indexLines.push('', `export { allIcons } from './all';`);
  await fs.writeFile(indexFile, indexLines.join('\n') + '\n', { encoding: 'utf-8' });

  const allImports = icons.map(({ exportName, iconName }) => `import { ${exportName} } from './svg/${iconName}';`);
  const allExport = ['', 'export const allIcons = {', ...icons.map(({ exportName }) => `  ${exportName},`), '};'];
  await fs.writeFile(allFile, [...allImports, ...allExport].join('\n') + '\n', { encoding: 'utf-8' });
};

return run().catch((err) => console.error(err));
