import { ComponentFactory, Injectable, Type } from '@angular/core';
import { ThemeDefinition } from '../shared/theme-definition';

@Injectable({
  providedIn: 'root',
})
export class ThemeRegisterService {
  readonly definitions: ReadonlyArray<ThemeDefinition> = [];

  register(globalStyleClass: string, componentFactory: ComponentFactory<any>): void {
    (this.definitions as ThemeDefinition[]).push({ globalStyleClass, componentFactory });
  }
}
