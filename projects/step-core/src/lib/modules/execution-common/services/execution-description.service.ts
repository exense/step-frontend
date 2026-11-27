import { ModelSignal } from '@angular/core';

export abstract class ExecutionDescriptionService {
  abstract readonly description: ModelSignal<string>;
}
