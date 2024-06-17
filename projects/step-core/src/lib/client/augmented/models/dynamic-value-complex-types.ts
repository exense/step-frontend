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

export type DynamicSimpleValue = DynamicValueString | DynamicValueInteger | DynamicValueBoolean;
export type DynamicComplexValue = DynamicValueObject | DynamicValueArray;
export type DynamicValue = DynamicSimpleValue | DynamicComplexValue;
