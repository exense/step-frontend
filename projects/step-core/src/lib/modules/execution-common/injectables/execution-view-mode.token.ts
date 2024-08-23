import { InjectionToken } from '@angular/core';
import { ExecutionViewMode } from '../types/execution-view-mode';

export const EXECUTION_VIEW_MODE = new InjectionToken<ExecutionViewMode>('Execution view mode');
