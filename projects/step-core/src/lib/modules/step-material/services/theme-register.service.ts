import { ComponentFactory, Injectable, Type } from '@angular/core';
import { ThemeDefinition } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class ThemeRegisterService {
  private _definitions: ThemeDefinition[] = [];

  get definitions(): ReadonlyArray<ThemeDefinition> {
    return this._definitions as ReadonlyArray<ThemeDefinition>;
  }

  register(globalStyleClass: string, componentFactory: ComponentFactory<any>): void {
    this._definitions.push({ globalStyleClass, componentFactory });
  }
}
