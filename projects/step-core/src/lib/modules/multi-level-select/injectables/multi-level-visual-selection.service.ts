import { Signal } from '@angular/core';
import { SelectionState } from '../types/selection-state.enum';

export abstract class MultiLevelVisualSelectionService<T extends string | number | symbol> {
  abstract readonly visualSelectionState: Signal<Record<T, SelectionState>>;
}
