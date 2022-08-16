import { CustomRegistryItem } from './custom-registry-item';
import { Type } from '@angular/core';

export interface EntityItem extends CustomRegistryItem {
  icon?: Type<unknown>;
}
