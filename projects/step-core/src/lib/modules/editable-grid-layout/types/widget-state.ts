import { WidgetPositionParams } from './widget-position';

export interface WidgetState {
  widgetType: string;
  position?: WidgetPositionParams;
  settings?: Record<string, any>;
}
