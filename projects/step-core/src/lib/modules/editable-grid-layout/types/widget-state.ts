import { WidgetPositionParams } from './widget-position';

export interface WidgetState {
  id: string;
  widgetType: string;
  position?: WidgetPositionParams;
}
