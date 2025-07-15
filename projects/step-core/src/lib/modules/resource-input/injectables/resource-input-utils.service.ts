import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ResourceInputUtilsService {
  convertIdToResourceValue(resourceId: string): string {
    return `resource:${resourceId}`;
  }

  isResourceValue(value?: string): boolean {
    return !!value && typeof value === 'string' && value.startsWith('resource:');
  }

  getResourceId(value?: string): string | undefined {
    if (!this.isResourceValue(value)) {
      return undefined;
    }
    return value!.replace('resource:', '');
  }
}
