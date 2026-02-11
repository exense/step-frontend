import { Signal } from '@angular/core';
import { GridElementInfo } from '../../custom-registeries/custom-registries.module';

export type VisibilityInfo = Pick<GridElementInfo, 'id' | 'title'> & { isVisible: boolean };

export abstract class WidgetsVisibilityStateService {
  abstract isVisible(id: string): boolean;
  abstract show(id: string): void;
  abstract hide(id: string): void;
  abstract readonly visibilityInfo: Signal<VisibilityInfo[]>;
}
