import { Injectable } from '@angular/core';
import { getResourceId, isResourceId } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class ResourceInputUtilsService {
  convertIdToResourceValue(resourceId: string): string {
    return `resource:${resourceId}`;
  }

  isResourceValue(value?: string): boolean {
    return !!value && typeof value === 'string' && isResourceId(value);
  }

  getResourceId(value?: string): string | undefined {
    if (!this.isResourceValue(value)) {
      return undefined;
    }
    return getResourceId(value!);
  }
}
