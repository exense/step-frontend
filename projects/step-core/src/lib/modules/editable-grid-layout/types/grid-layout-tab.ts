import { GridPresetListItem } from './grid-preset-list-item';
import { Tab } from '../../tabs';

export interface GridLayoutTab extends Tab<string> {
  layout?: GridPresetListItem;
}
