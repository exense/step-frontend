import { Observable } from 'rxjs';

export abstract class DragDataService {
  abstract readonly dragAreaId: string;
  abstract readonly dragStart$: Observable<void>;
  abstract readonly dragEnd$: Observable<void>;
  abstract readonly isDragStarted: boolean;
  abstract readonly dragData?: unknown;
  abstract readonly dragData$: Observable<unknown | undefined>;
  abstract createDragImageForElement(element: HTMLElement): HTMLElement;
  abstract dragStart(dragData?: unknown): void;
  abstract dragEnd(): void;
}
