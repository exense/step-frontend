import { Observable } from 'rxjs';
import { DragDropContainerService } from './drag-drop-container.service';
import { DragEndType } from '../types/drag-end-type.enum';

export abstract class DragDataService {
  abstract readonly dragStart$: Observable<void>;
  abstract readonly dragEnd$: Observable<DragEndType>;
  abstract readonly isDragStarted: boolean;
  abstract readonly dragData?: unknown;
  abstract readonly dragData$: Observable<unknown | undefined>;
  abstract createDragImageForElement(element: HTMLElement, container: DragDropContainerService): HTMLElement;
  abstract dragStart(dragData?: unknown): void;
  abstract dragEnd(type: DragEndType): void;
}
