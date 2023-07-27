const https = require('https');
const http = require('http');
const shell = require('shelljs');
const openapi = require('openapi-typescript-codegen');

const SPEC_URL = process.argv[2];
const GENERATED_CODE_LOCATION = './projects/step-core/src/lib/client/generated';
const CLIENT_MODULE_NAME = 'StepGeneratedClientModule';

function fetchSchema() {
  const service = (SPEC_URL ?? '').toLowerCase().startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    service
      .get(SPEC_URL, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          resolve(data);
        });
      })
      .on('error', (err) => reject(err));
  });
}

async function main() {
  //downloading file before executing openapi to make sure it is already generated in the BE
  await fetchSchema();
  await openapi.generate({
    input: SPEC_URL,
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
  shell.sed('-i', '.*Service.*', '', `${GENERATED_CODE_LOCATION}/${CLIENT_MODULE_NAME}.ts`);
  shell.sed('-i', '/rest', 'rest', `${GENERATED_CODE_LOCATION}/StepGeneratedClientModule.ts`);
  shell.exec(`npx prettier --write ${GENERATED_CODE_LOCATION}/*`);
  shell.exec(`npx prettier --write ${GENERATED_CODE_LOCATION}/**/*`);
  console.log('DONE');
}

main();
