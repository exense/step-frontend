import { Injectable } from '@angular/core';
import { SchemaField, SchemaSimpleField } from '../shared/dynamic-fields-schema';
import { DynamicFieldType } from '../shared/dynamic-field-type';
import { DynamicValue } from '../../../client/augmented/models/dynamic-value-complex-types';
import { DynamicFieldArrayValue, DynamicFieldObjectValue } from '../shared/dynamic-field-group-value';

interface FieldMetaParameters {
  fieldSchema?: SchemaField;
  fieldType?: DynamicFieldType;
  enumItems: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DynamicFieldUtilsService {
  determineFieldMetaParameters(fieldDescription: SchemaField = {}): FieldMetaParameters {
    let fieldSchema: SchemaField | undefined;
    let fieldType: DynamicFieldType | undefined;
    let enumItems: string[] = [];

    if ((fieldDescription as SchemaSimpleField).enum) {
      fieldType = DynamicFieldType.ENUM;
      enumItems = (fieldDescription as SchemaSimpleField).enum!;
    } else {
      switch (fieldDescription.type) {
        case 'string':
          fieldType = DynamicFieldType.STRING;
          break;
        case 'number':
        case 'integer':
          fieldType = DynamicFieldType.NUMBER;
          break;
        case 'boolean':
          fieldType = DynamicFieldType.BOOLEAN;
          break;
        case 'array':
          fieldType = DynamicFieldType.ARRAY;
          fieldSchema = fieldDescription.items;
          break;
        case 'object':
          fieldType = DynamicFieldType.OBJECT;
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
