import { InjectionToken } from '@angular/core';
import { WizardGlobalContext } from '../types/wizard-global-context.interface';

export const WIZARD_GLOBAL_CONTEXT = new InjectionToken<WizardGlobalContext>('Token to receive wizard global context');
