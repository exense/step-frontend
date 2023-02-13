import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../../../client/step-client-module';

export type DynamicFieldGroupValue = Record<string, DynamicValueString | DynamicValueBoolean | DynamicValueInteger>;
