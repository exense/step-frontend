import { AbstractArtefact, DynamicValueBoolean, DynamicValueInteger } from '@exense/step-core';

export interface RetryIfFailsArtefact extends AbstractArtefact {
  maxRetries: DynamicValueInteger;
  gracePeriod: DynamicValueInteger;
  timeout: DynamicValueInteger;
  releaseTokens: DynamicValueBoolean;
  reportLastTryOnly: DynamicValueBoolean;
}
