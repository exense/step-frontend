import { InjectionToken } from '@angular/core';
import { ResourceInputService } from './resource-input.service';

export const RESOURCE_INPUT = new InjectionToken<ResourceInputService>('Applied instance of resource input service');
