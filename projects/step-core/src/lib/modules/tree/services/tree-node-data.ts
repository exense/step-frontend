import { Signal } from '@angular/core';

export abstract class TreeNodeData {
  abstract readonly id: Signal<string>;
  abstract readonly level: Signal<number>;
  abstract readonly levelOffset: Signal<number>;
}
