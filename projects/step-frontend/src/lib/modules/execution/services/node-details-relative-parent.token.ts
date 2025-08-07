import { InjectionToken } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export const NODE_DETAILS_RELATIVE_PARENT = new InjectionToken<ActivatedRoute>('Activated route');
