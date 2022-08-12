import { Type } from '@angular/core';
import { CustomComponent } from './custom-component';

export interface CustomRegistryItem {
  type: string;
  label: string;
  component?: Type<CustomComponent>;
}
