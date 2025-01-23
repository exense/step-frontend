import { ElementRef, inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, switchMap, throttleTime, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DragDropGroupService } from './drag-drop-group.service';
import { GROUP_DROP_AREA_ID } from './drop-area-id.token';
import { DragDataService } from './drag-data.service';
import { DRAG_DROP_CLASS_NAMES } from './drag-drop-class-names.token';
import { DragDropContainerService } from './drag-drop-container.service';
import { DragEndType } from '../types/drag-end-type.enum';

@Injectable()
export class DragDropGroupContainerService implements DragDataService, DragDropGroupService, OnDestroy {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef, { self: true });
  private _classNames = inject(DRAG_DROP_CLASS_NAMES);
  private _dropAreaId = inject(GROUP_DROP_AREA_ID, { self: true, optional: true });
  private _zone = inject(NgZone);
  private dragDropContainers: DragDropContainerService[] = [];

  private dragStartInternal$ = new Subject<void>();
  private dragEndInternal$ = new Subject<DragEndType>();

  readonly dragStart$ = this.dragStartInternal$.asObservable();
  readonly dragEnd$ = this.dragEndInternal$.pipe(throttleTime(100));

  private isDragStartedInternal = false;

  get isDragStarted() {
    return this.isDragStartedInternal;
  }

  get dropAreaId(): string {
    return this._dropAreaId ?? '';
  }

  private dragDataInternal$ = new BehaviorSubject<unknown | undefined>(undefined);

  readonly dragData$ = this.dragDataInternal$.asObservable();

  get dragData(): unknown | undefined {
    return this.dragDataInternal$.value;
  }

  private cleanupOnDragEndSubscription = this.dragEnd$
    .pipe(
      switchMap(() => timer(50)),
      takeUntilDestroyed(),
    )
    .subscribe(() => this.cleanup());

  private get dragImageContainer(): HTMLElement | undefined {
    let result: HTMLElement | undefined = undefined;
    for (let container of this.dragDropContainers) {
      result = container.getImageContainer();
      if (result) {
        break;
      }
    }
    return result;
  }

  ngOnDestroy(): void {
    this.dragStartInternal$.complete();
    this.dragEndInternal$.complete();
    this.dragDropContainers = [];
    this.cleanup();
  }

  registerGroupItem(item: DragDropContainerService): void {
    this.dragDropContainers.push(item);
  }

  unregisterGroupItem(item: DragDropContainerService): void {
    this.dragDropContainers.splice(this.dragDropContainers.indexOf(item), 1);
  }

  createDragImageForElement(element: HTMLElement, container: DragDropContainerService): HTMLElement {
    let previewNode = container.getPreviewNode();
    if (previewNode) {
      return previewNode;
    }

    previewNode = element.cloneNode(true) as HTMLElement;
    previewNode.draggable = false;
    previewNode.classList.remove(this._classNames.DRAG_IN_PROGRESS);
    this.dragImageContainer?.appendChild(previewNode);
    return previewNode;
  }

  dragStart(dragData?: unknown): void {
    this.dragDataInternal$.next(dragData);
    this.setIsDragStarted(true);
    this.dragStartInternal$.next();
  }

  dragEnd(type: DragEndType): void {
    this.dragDataInternal$.next(undefined);
    this.setIsDragStarted(false);
    this.dragEndInternal$.next(type);
  }

  private cleanup(): void {
    this._zone.runOutsideAngular(() => {
      this._elRef.nativeElement?.querySelectorAll?.(`.${this._classNames.DRAG_OVER}`)?.forEach((element) => {
        element.classList.remove(this._classNames.DRAG_OVER);
      });
      this._elRef.nativeElement?.querySelectorAll?.(`.${this._classNames.DRAG_IN_PROGRESS}`)?.forEach((element) => {
        element.classList.remove(this._classNames.DRAG_IN_PROGRESS);
      });
      this.dragImageContainer?.childNodes?.forEach((child) => child.remove());
    });
  }

  private setIsDragStarted(value: boolean): void {
    this.isDragStartedInternal = value;
    this.dragDropContainers.forEach((container) => container.setIsDragStarted(value));
  }
}
