import { InjectionToken } from '@angular/core';

export interface DragDropClassNames {
  readonly DRAG_IN_PROGRESS: string;
  readonly DRAG_OVER: string;
}

export const DRAG_DROP_CLASS_NAMES = new InjectionToken<DragDropClassNames>('Drag & drop class names', {
  providedIn: 'root',
  factory: () =>
    ({
      DRAG_IN_PROGRESS: 'drag-in-progress',
      DRAG_OVER: 'dragover',
    }) as DragDropClassNames,
});
