import { CustomRegistryItem } from './custom-registry-item';
import { Type } from '@angular/core';
import { CustomComponent } from './custom-component';

export interface EntityItem extends CustomRegistryItem {
  icon?: Type<CustomComponent>;
}
