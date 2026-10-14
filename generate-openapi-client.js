const { readFile } = require('node:fs/promises');
const shell = require('shelljs');
const openapi = require('openapi-typescript-codegen');

const STUDIO_MODE = process.argv.includes('--studio');
const SPEC_URL = process.argv.slice(2).find((argument) => argument !== '--studio');
const GENERATED_CODE_LOCATION = './projects/step-core/src/lib/client/generated';
const CLIENT_MODULE_NAME = 'StepGeneratedClientModule';

async function fetchSchema() {
  if (!SPEC_URL) {
    throw new Error('Provide an OpenAPI URL or JSON file, optionally followed by --studio.');
  }
  if (!/^https?:\/\//i.test(SPEC_URL)) {
    return JSON.parse(await readFile(SPEC_URL, 'utf8'));
  }
  const response = await fetch(SPEC_URL);
  if (!response.ok) {
    throw new Error(`Unable to fetch OpenAPI schema: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function provideHttpContextFeatureToRequest() {
  const API_REQUEST_OPTIONS = `${GENERATED_CODE_LOCATION}/core/ApiRequestOptions.ts`;
  const REQUEST = `${GENERATED_CODE_LOCATION}/core/request.ts`;

  if (!shell.cat(API_REQUEST_OPTIONS).includes('HttpContext')) {
    shell.sed(
      '-i',
      /(export type ApiRequestOptions.*)/,
      "import {HttpContext} from '@angular/common/http';\n\n$1",
      API_REQUEST_OPTIONS,
    );
    shell.sed('-i', /(readonly url: string;)/, '$1\nreadonly context?: HttpContext;', API_REQUEST_OPTIONS);
  }

  if (!shell.cat(REQUEST).includes('context')) {
    shell.sed('-i', /(observe: 'response',)/, '$1\ncontext: options.context,', REQUEST);
  }
}

function extractOpenApiConfig() {
  const MODULE = `${GENERATED_CODE_LOCATION}/${CLIENT_MODULE_NAME}.ts`;
  const PROVIDER = `${GENERATED_CODE_LOCATION}/open-api-config.provider.ts`;
  const beginStr = shell.grep('-n', 'provide: OpenAPI', MODULE).toString();
  const endStr = shell.grep('-n', 'as OpenAPIConfig', MODULE).toString();
  const begin = parseInt(beginStr.split(':')[0]);
  const end = parseInt(endStr.split(':')[0]);

  const data = shell
    .head({ '-n': end }, MODULE)
    .tail({ '-n': end - begin + 1 })
    .toString();

  const result =
    `import { Provider } from '@angular/core';\n` +
    `import type {OpenAPIConfig} from './core/OpenAPI';\n` +
    `import {OpenAPI} from './core/OpenAPI';\n\n` +
    `export const OPEN_API_CONFIG_PROVIDER: Provider = {\n` +
    data +
    `};\n`;

  shell.echo(result).to(PROVIDER);
}

async function main() {
  const schema = await fetchSchema();
  if (STUDIO_MODE) {
    await require('./generate-studio-openapi-client').generateStudioClient(schema);
    return;
  }
  await openapi.generate({
    input: schema,
    output: GENERATED_CODE_LOCATION,
    httpClient: 'angular',
    useUnionTypes: true,
    clientName: CLIENT_MODULE_NAME,
    exportCore: false,
    exportSchemas: true,
  });
  shell.ls(`${GENERATED_CODE_LOCATION}/services/*Service.ts`).forEach((file) => {
    shell.sed('-i', `@Injectable\\(\\)`, `@Injectable({providedIn:'root'})`, file);
  });

  provideHttpContextFeatureToRequest();
  extractOpenApiConfig();

  shell.sed('-i', '.*Service.*', '', `${GENERATED_CODE_LOCATION}/${CLIENT_MODULE_NAME}.ts`);
  shell.sed('-i', '/rest', 'rest', `${GENERATED_CODE_LOCATION}/StepGeneratedClientModule.ts`);
  shell.exec(`npx prettier --write ${GENERATED_CODE_LOCATION}/*`);
  shell.exec(`npx prettier --write ${GENERATED_CODE_LOCATION}/**/*`);
  console.log('DONE');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
