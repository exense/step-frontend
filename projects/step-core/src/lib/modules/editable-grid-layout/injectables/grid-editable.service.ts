import { Signal } from '@angular/core';

export abstract class GridEditableService {
  abstract readonly editMode: Signal<boolean>;
}
