import { DynamicValueArray, DynamicValueObject } from '../../../client/step-client-module';

export type DynamicFieldObjectValue = Required<DynamicValueObject>['value'];
export type DynamicFieldArrayValue = Required<DynamicValueArray>['value'];

export type DynamicFieldGroupValue = DynamicFieldObjectValue | DynamicFieldArrayValue;
