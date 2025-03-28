import { inject, Injectable } from '@angular/core';
import { JsonFieldType } from '../types/json-field-type.enum';
import { SchemaField, SchemaSimpleField } from '../types/json-field-schema';
import { DynamicValuesUtilsService } from '../../basics/step-basics.module';
import { DynamicValue } from '../../../client/augmented/models/dynamic-value-complex-types';

interface FieldMetaParameters {
  fieldSchema?: SchemaField;
  fieldType?: JsonFieldType;
  tooltip?: string;
  enumItems: string[];
}

@Injectable({
  providedIn: 'root',
})
export class JsonFieldUtilsService {
  private _dynamicValueUtils = inject(DynamicValuesUtilsService);

  determineFieldMetaParameters(fieldDescription: SchemaField = {}): FieldMetaParameters {
    let fieldSchema: SchemaField | undefined;
    let fieldType: JsonFieldType | undefined;
    let enumItems: string[] = [];
    const tooltip = fieldDescription.description;

    if ((fieldDescription as SchemaSimpleField).enum) {
      fieldType = JsonFieldType.ENUM;
      enumItems = (fieldDescription as SchemaSimpleField).enum!;
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

    return { fieldSchema, fieldType, enumItems, tooltip };
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

  getDefaultValueForDynamicModel(field?: SchemaField): DynamicValue['value'] {
    if (!field || !field.default) {
      return undefined;
    }

    if (field.type === 'array') {
      const items = field.default as (string | number | boolean)[];
      return items.map((item) => this._dynamicValueUtils.convertSimpleValueToDynamicValue(item));
    }

    if (field.type === 'object') {
      const objContainer = field.default as Record<string, string | number | boolean>;
      return Object.entries(objContainer).reduce(
        (res, [key, value]) => {
          res[key] = this._dynamicValueUtils.convertSimpleValueToDynamicValue(value);
          return res;
        },
        {} as Record<string, DynamicValue>,
      );
    }

    return field.default;
  }
}
