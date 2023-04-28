import { InjectionToken } from '@angular/core';
import { AbstractArtefact } from '@exense/step-core';
export const ARTEFACTS_CLIPBOARD = new InjectionToken<AbstractArtefact[]>('Artefact clipboard', {
  providedIn: 'root',
  factory: () => [],
});
