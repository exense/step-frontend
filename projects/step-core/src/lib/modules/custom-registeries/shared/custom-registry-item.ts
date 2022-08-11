import { Type } from '@angular/core';

export interface CustomRegistryItem {
  type: string;
  label: string;
  component?: Type<unknown>;
}
