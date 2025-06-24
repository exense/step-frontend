import { Signal } from '@angular/core';

export abstract class ElementSizeService {
  abstract readonly width: Signal<number>;
  abstract readonly height: Signal<number>;
}
