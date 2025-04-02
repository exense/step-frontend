import { inject, Injectable } from '@angular/core';
import { TimeConvertersFactoryService } from './time-converters-factory.service';
import {
  DynamicValue,
  DynamicValueBoolean,
  DynamicValueInteger,
  DynamicValueString,
} from '../../../client/step-client-module';
import { TIME_UNIT_DICTIONARY, TIME_UNIT_LABELS, TimeUnit, TimeUnitDictKey } from '../types/time-unit.enum';

export type SimpleValue = undefined | null | string | boolean | number | object | Array<unknown>;
export type SimpleOrDynamicValue = SimpleValue | DynamicValue;

@Injectable({
  providedIn: 'root',
})
export class DynamicValuesUtilsService {
  private _timeConverter = inject(TimeConvertersFactoryService).timeConverter();

  isDynamicValue(value: SimpleOrDynamicValue): boolean {
    if (!value || typeof value !== 'object') {
      return false;
    }
    return value.hasOwnProperty('dynamic') && (value.hasOwnProperty('value') || value.hasOwnProperty('expression'));
  }

  createEmptyDynamicValue(): DynamicValue {
    return { value: undefined, dynamic: false };
  }

  convertSimpleValueToDynamicValue(value: string | number | boolean): DynamicValue {
    return { value, dynamic: false, expression: '' };
  }

  convertDynamicValueToSimpleValue(
    value?: DynamicValueString | DynamicValueInteger | DynamicValueBoolean,
  ): string | number | boolean | undefined {
    if (!value) {
      return undefined;
    }
    if (value.dynamic) {
      return value.expression;
    }
    let result = value.value;
    if (!result) {
      return result;
    }
    if (typeof result === 'object') {
      result = JSON.stringify(result);
    }
    return result;
  }

  parseJson<T = string>(value?: string): Record<string, T> | undefined {
    if (!value) {
      return undefined;
    }
    try {
      return JSON.parse(value) as Record<string, T>;
    } catch (e) {
      return undefined;
    }
  }

  convertTimeDynamicValue(
    value: DynamicValueInteger,
    unit: TimeUnitDictKey = 'ms',
    allowedUnits?: TimeUnit[],
  ): { value: string; unit: TimeUnitDictKey } {
    if (value.dynamic) {
      return { value: value.expression ?? '', unit };
    }
    allowedUnits = allowedUnits ?? Object.values(TIME_UNIT_DICTIONARY);
    const measure = TIME_UNIT_DICTIONARY[unit] as TimeUnit;
    const newMeasure = this._timeConverter.autoDetermineDisplayMeasure(value.value ?? 0, measure, allowedUnits);
    const converted = this._timeConverter.calculateDisplayValue(value?.value ?? 0, measure, newMeasure);
    const newUnit = TIME_UNIT_LABELS[newMeasure] as TimeUnitDictKey;
    return { value: converted.toString(), unit: newUnit };
  }
}
