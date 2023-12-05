// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { initializeWingman } from '@logicflow-ai/astra-wingman';

type WingmanConfig = Parameters<typeof initializeWingman>[0];

export const environment = {
  production: false,
  wingmanConfig: {
    endpoint: 'https://astra.logicflow.ai/',
    application: 'Autonomous STEP',
    projectId: '38eb9b47-5483-4e09-88e6-defc8b4e4216',
    environments: ['http://localhost:4201', 'https://stepos-sed-2461.stepcloud-test.ch'],
    active: true,
    allowPassword: true,
    language: () => 'en',
    username: () => 'admin',
    customState: () => {
      return { role: 'admin' };
    },
    debugging: true,
    testing: false,
    flowGpt: false,
    gptInContext: false,
  } as WingmanConfig | undefined,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
