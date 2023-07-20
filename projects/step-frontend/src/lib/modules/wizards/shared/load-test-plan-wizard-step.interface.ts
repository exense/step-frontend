import { WizardStep } from '@exense/step-core';

export interface LoadTestPlanWizardStep extends WizardStep {
  type: 'load-test-plan';
  threads: number;
  pacing: number;
  iterations: number;
  maxDuration: number;
}
