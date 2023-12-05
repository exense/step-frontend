import { initializeWingman } from '@logicflow-ai/astra-wingman';
type WingmanConfig = Parameters<typeof initializeWingman>[0];

export const environment = {
  production: true,
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
