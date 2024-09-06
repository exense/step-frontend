import { DynamicValueString } from '../../client/step-client-module';

export interface ArtefactInlineItem {
  label: string;
  isResolved: boolean;
  value: DynamicValueString;
}
