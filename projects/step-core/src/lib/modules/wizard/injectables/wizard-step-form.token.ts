import { InjectionToken } from '@angular/core';
import { FormGroup } from '@angular/forms';

export const WIZARD_STEP_FORM = new InjectionToken<FormGroup>('Wizard step form');
