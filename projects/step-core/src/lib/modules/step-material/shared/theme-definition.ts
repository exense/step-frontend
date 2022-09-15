import { ComponentFactory } from '@angular/core';

export interface ThemeDefinition {
  readonly globalStyleClass: string;
  readonly componentFactory: ComponentFactory<any>;
}
