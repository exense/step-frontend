const fs = require('node:fs/promises');
const { existsSync } = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const openapi = require('openapi-typescript-codegen');

const CLIENT_DIRECTORY = './projects/step-core/src/lib/client';
const OUTPUT_DIRECTORY = `${CLIENT_DIRECTORY}/ide-generated`;

async function generateStudioClient(schema) {
  if (!schema?.paths) {
    throw new Error('The schema is invalid or missing paths.');
  }
  const paths = Object.fromEntries(
    Object.entries(schema.paths).filter(
      ([endpoint]) =>
        endpoint.startsWith('/local/studio/ap/') ||
        endpoint.startsWith('/local/studio/remote-') ||
        endpoint.startsWith('/local/fs/'),
    ),
  );
  if (!paths['/local/studio/ap/current'] || !paths['/local/fs/listDirectory']) {
    throw new Error('The schema must come from a Studio backend and contain Studio and filesystem endpoints.');
  }

  const schemas = {};
  function collectSchemas(value) {
    if (!value || typeof value !== 'object') {
      return;
    }
    const reference = value.$ref;
    if (reference?.startsWith('#/components/schemas/')) {
      const name = reference.slice('#/components/schemas/'.length);
      if (!schemas[name]) {
        const definition = schema.components?.schemas?.[name];
        if (!definition) {
          throw new Error(`Missing schema definition: ${name}`);
        }
        schemas[name] = definition;
        collectSchemas(definition);
      }
    }
    Object.values(value).forEach(collectSchemas);
  }
  collectSchemas(paths);

  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'step-studio-client-'));
  try {
    await openapi.generate({
      input: { ...schema, paths, components: { ...schema.components, schemas } },
      output: temporaryDirectory,
      httpClient: 'angular',
      clientName: 'StepStudioClientModule',
      useUnionTypes: true,
      exportCore: false,
      exportSchemas: true,
    });

    const sharedModels = Object.keys(schemas).filter((name) =>
      existsSync(`${CLIENT_DIRECTORY}/generated/models/${name}.ts`),
    );
    for (const directory of ['models', 'schemas', 'services']) {
      for (const filename of await fs.readdir(path.join(temporaryDirectory, directory))) {
        const file = path.join(temporaryDirectory, directory, filename);
        const modelName = path.basename(filename, '.ts').replace(/^\$/, '');
        if (directory !== 'services' && sharedModels.includes(modelName)) {
          await fs.unlink(file);
          continue;
        }
        let content = await fs.readFile(file, 'utf8');
        content = content.replace("'../core/BaseHttpRequest'", "'../../generated/core/BaseHttpRequest'");
        content = content.replace('@Injectable()', "@Injectable({ providedIn: 'root' })");
        for (const name of sharedModels) {
          content = content.replaceAll(`'../models/${name}'`, `'../../generated/models/${name}'`);
          content = content.replaceAll(`'./${name}'`, `'../../generated/models/${name}'`);
        }
        await fs.writeFile(file, content);
      }
    }
    const indexFile = path.join(temporaryDirectory, 'index.ts');
    const index = (await fs.readFile(indexFile, 'utf8'))
      .split('\n')
      .filter((line) => !line.includes("'./StepStudioClientModule'"))
      .filter(
        (line) =>
          !sharedModels.some((name) => line.includes(`'./models/${name}'`) || line.includes(`'./schemas/$${name}'`)),
      )
      .join('\n');
    await fs.writeFile(indexFile, index);
    await fs.unlink(path.join(temporaryDirectory, 'StepStudioClientModule.ts'));
    execFileSync(
      process.execPath,
      [require.resolve('prettier/bin/prettier.cjs'), '--write', temporaryDirectory, '--config', './.prettierrc'],
      { stdio: 'inherit' },
    );
    await fs.rm(OUTPUT_DIRECTORY, { recursive: true, force: true });
    await fs.cp(temporaryDirectory, OUTPUT_DIRECTORY, { recursive: true });
    console.log('Studio client generated. Shared models and HTTP infrastructure are reused from the OS client.');
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
}

module.exports = { generateStudioClient };
