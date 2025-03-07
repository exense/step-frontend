import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../../../client/step-client-module';

export interface ArtefactInlineItem {
  icon?: string;
  iconTooltip?: string;
  isLabelResolved?: boolean;
  isValueResolved?: boolean;
  label?: DynamicValueString | DynamicValueInteger | DynamicValueBoolean;
  labelTooltip?: string;
  value?: DynamicValueString | DynamicValueInteger | DynamicValueBoolean;
  valueTooltip?: string;
  isValueFirst?: boolean;
  prefix?: string;
  suffix?: string;
}
