import { Injectable } from '@angular/core';
import { SchemaField } from '../shared/dynamic-fields-schema';
import { DynamicValue } from '../../../client/augmented/models/dynamic-value-complex-types';
import { DynamicFieldArrayValue, DynamicFieldObjectValue } from '../shared/dynamic-field-group-value';
import { JsonFieldType } from '../../json-forms';

interface FieldMetaParameters {
  fieldSchema?: SchemaField;
  fieldType?: JsonFieldType;
  enumItems: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DynamicFieldUtilsService {
  determineFieldMetaParameters(fieldDescription: SchemaField = {}): FieldMetaParameters {
    let fieldSchema: SchemaField | undefined;
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
          fieldSchema = fieldDescription.items;
          break;
        case 'object':
          fieldType = JsonFieldType.OBJECT;
          fieldSchema = fieldDescription.properties;
          break;
        default:
          break;
      }
    }

    return { fieldSchema, fieldType, enumItems };
  }

  areDynamicFieldObjectsEqual(objectA?: DynamicFieldObjectValue, objectB?: DynamicFieldObjectValue): boolean {
    if (objectA === objectB) {
      return true;
    }
    if (objectA === undefined || objectB === undefined) {
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
      if (!this.areDynamicValuesEqual(fieldA, fieldB)) {
        return false;
      }
    }
    return true;
  }

  areDynamicFieldArraysEqual(arrayA?: DynamicFieldArrayValue, arrayB?: DynamicFieldArrayValue): boolean {
    if (arrayA === arrayB) {
      return true;
    }
    if (arrayA === undefined || arrayB === undefined) {
      return false;
    }
    if (arrayA.length !== arrayB.length) {
      return false;
    }
    for (let i = 0; i < arrayA.length; i++) {
      const itemA = arrayA[i];
      const itemB = arrayB[i];
      if (!this.areDynamicValuesEqual(itemA, itemB)) {
        return false;
      }
    }
    return true;
  }

  areDynamicValuesEqual(itemA?: DynamicValue, itemB?: DynamicValue): boolean {
    return !(
      itemA?.dynamic !== itemB?.dynamic ||
      itemA?.value !== itemB?.value ||
      itemA?.expression !== itemB?.expression ||
      itemA?.expressionType !== itemB?.expression
    );
  }
}
