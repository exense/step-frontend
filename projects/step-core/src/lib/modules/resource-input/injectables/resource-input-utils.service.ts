import { Injectable } from '@angular/core';
import {
  extractApId,
  extractApResourcePath,
  getResourceId,
  isApResourceId,
  isResourceId,
} from '../../basics/step-basics.module';

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

  convertToApResourceValue(apId: string, path: string): string {
    return `apResource:${apId}:${path}`;
  }

  isApResourceValue(value?: string): boolean {
    return !!value && typeof value === 'string' && isApResourceId(value);
  }

  getResourceApId(value?: string): string | undefined {
    if (!this.isApResourceValue(value)) {
      return undefined;
    }
    return extractApId(value!);
  }

  getResourceApPath(value?: string): string | undefined {
    if (!this.isApResourceValue(value)) {
      return undefined;
    }
    return extractApResourcePath(value!);
  }
}
