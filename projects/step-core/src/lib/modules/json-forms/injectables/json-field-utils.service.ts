import { Injectable } from '@angular/core';
import { JsonFieldType } from '../types/json-field-type.enum';
import { JsonFieldProperty } from '../types/json-field-schema';

interface FieldMetaParameters {
  fieldType?: JsonFieldType;
  enumItems: string[];
}

@Injectable({
  providedIn: 'root',
})
export class JsonFieldUtilsService {
  determineFieldMetaParameters(fieldDescription: JsonFieldProperty = {}): FieldMetaParameters {
    let fieldType: JsonFieldType | undefined;
    let enumItems: string[] = [];

    if (!fieldDescription.type && fieldDescription.enum) {
      fieldType = JsonFieldType.ENUM;
      enumItems = fieldDescription.enum;
    } else {
      switch (fieldDescription.type) {
        case 'string':
          fieldType = JsonFieldType.STRING;
          break;
        case 'number':
        case 'integer':
          fieldType = JsonFieldType.NUMBER;
          break;
        case 'boolean':
          fieldType = JsonFieldType.BOOLEAN;
          break;
        case 'array':
          fieldType = JsonFieldType.ARRAY;
          break;
        case 'object':
          fieldType = JsonFieldType.OBJECT;
          break;
        default:
          break;
      }
    }

    return { fieldType, enumItems };
  }

  areObjectsEqual<T>(
    objectA?: Record<string, T> | null,
    objectB?: Record<string, T> | null,
    areValuesEqual: (valueA?: T | null, valueB?: T | null) => boolean = (valueA, valueB) => valueA === valueB,
  ): boolean {
    if (objectA === objectB) {
      return true;
    }
    if (!objectA || !objectB) {
      return false;
    }
    const keysA = Object.keys(objectA || {});
    const keysB = Object.keys(objectB || {});
    if (keysA.length !== keysB.length) {
      return false;
    }
    const keysEqual = keysA.every((key) => keysB.includes(key));
    if (!keysEqual) {
      return false;
    }
    for (let key of keysA) {
      const fieldA = objectA?.[key];
      const fieldB = objectB?.[key];
      if (!areValuesEqual(fieldA, fieldB)) {
        return false;
      }
    }
    return true;
  }

  areArraysEqual<T>(
    arrayA?: T[] | null,
    arrayB?: T[] | null,
    areValuesEqual: (valueA?: T | null, valueB?: T | null) => boolean = (valueA, valueB) => valueA === valueB,
  ): boolean {
    if (arrayA === arrayB) {
      return true;
    }
    if (!arrayA || !arrayB) {
      return false;
    }
    if (arrayA.length !== arrayB.length) {
      return false;
    }
    for (let i = 0; i < arrayA.length; i++) {
      const itemA = arrayA[i];
      const itemB = arrayB[i];
      if (!areValuesEqual(itemA, itemB)) {
        return false;
      }
    }
    return true;
  }
}
