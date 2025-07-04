import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ObjectUtilsService {
  getObjectFieldValue<T extends object, R>(object: T, fieldPath: string): R {
    const pathParts = fieldPath.split('.');

    return pathParts.reduce((res: Record<string, unknown> | unknown, fieldName: string) => {
      if (typeof res !== 'object' || res === null || res === undefined) {
        return res;
      }

      return (res as Record<string, unknown>)[fieldName];
    }, object) as R;
  }

  setObjectFieldValue<T extends object, V>(object: T, fieldPath: string, value: V): T {
    if (typeof object !== 'object' || object === null || object === undefined) {
      return object;
    }

    const result = { ...object };

    const pathParts = fieldPath.split('.');

    pathParts.reduce((res: Record<string, unknown> | unknown, fieldName: string, index) => {
      if (typeof res !== 'object' || res === null || res === undefined) {
        return;
      }
      const container = res as Record<string, unknown>;

      container[fieldName] = index < pathParts.length - 1 ? container[fieldName] ?? {} : value;

      return container[fieldName];
    }, result);

    return result;
  }
}
