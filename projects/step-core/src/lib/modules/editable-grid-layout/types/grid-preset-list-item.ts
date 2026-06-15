import { KeyValue } from '@angular/common';
import { WidgetStatePreset } from './widget-state-preset';

export interface GridPresetListItem extends KeyValue<string, string> {
  visibility?: WidgetStatePreset['visibility'];
  creationUser?: string;
}
