import {WidgetState} from './widget-state';

export interface WidgetStatePreset {
  id: string;
  name: string;
  protected?: boolean;
  widgets: WidgetState[];
}