import { WidgetState } from './widget-state';
import { ReportLayout } from '../../../client/step-client-module';

export type WidgetStatePreset = ReportLayout & {
  layout?: {
    widgets: WidgetState[];
  };
};
