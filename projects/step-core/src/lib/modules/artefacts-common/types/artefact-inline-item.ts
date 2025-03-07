import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../../../client/step-client-module';

export interface ArtefactInlineItem {
  icon?: string;
  iconTooltip?: string;
  isLabelResolved?: boolean;
  isValueResolved?: boolean;
  label?: DynamicValueString | DynamicValueInteger | DynamicValueBoolean;
  value?: DynamicValueString | DynamicValueInteger | DynamicValueBoolean;
  isValueFirst?: boolean;
  prefix?: string;
  suffix?: string;
}
