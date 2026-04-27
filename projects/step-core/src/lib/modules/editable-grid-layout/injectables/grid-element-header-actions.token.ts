import { InjectionToken, Type } from '@angular/core';

export interface GridElementHeaderAction {
  component: Type<unknown>;
  widgetTypes?: readonly string[];
}

export const GRID_ELEMENT_HEADER_ACTIONS = new InjectionToken<readonly GridElementHeaderAction[]>(
  'GRID_ELEMENT_HEADER_ACTIONS',
);
