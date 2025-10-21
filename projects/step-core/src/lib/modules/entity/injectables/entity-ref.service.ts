import { Signal } from '@angular/core';

export abstract class EntityRefService<T extends { attributes?: Record<string, string> }> {
  abstract currentEntity: Signal<T | undefined>;
}
