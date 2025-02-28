import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../../client/step-client-module';

export interface ArtefactInlineItem {
  icon?: string;
  iconTooltip?: string;
  label: string;
  isResolved?: boolean;
  value?: DynamicValueString | DynamicValueInteger | DynamicValueBoolean;
}
