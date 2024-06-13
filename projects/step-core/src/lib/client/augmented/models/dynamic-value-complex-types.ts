import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../../generated';

export type DynamicValueObject = {
  dynamic?: boolean;
  value?: Record<
    string,
    DynamicValueString | DynamicValueBoolean | DynamicValueInteger | DynamicValueObject | DynamicValueArray
  >;
  expression?: string;
  expressionType?: string;
};

export type DynamicValueArray = {
  dynamic?: boolean;
  value?: Array<
    DynamicValueString | DynamicValueBoolean | DynamicValueInteger | DynamicValueObject | DynamicValueArray
  >;
  expression?: string;
  expressionType?: string;
};

export type DynamicValue =
  | DynamicValueString
  | DynamicValueBoolean
  | DynamicValueInteger
  | DynamicValueObject
  | DynamicValueArray;
