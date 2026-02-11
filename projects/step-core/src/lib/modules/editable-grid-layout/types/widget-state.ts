import { WidgetPositionParams } from './widget-position';

export interface WidgetState {
  id: string;
  isVisible: boolean;
  position?: WidgetPositionParams;
}
