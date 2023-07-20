import { WizardStep } from '@exense/step-core';

export interface CypressKeywordWizardStep extends WizardStep {
  type: 'cypress-keyword';
  project: string;
  spec: string;
}
