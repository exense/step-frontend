import {
  AfterViewInit,
  Directive,
  effect,
  ElementRef,
  inject,
  Injector,
  NgZone,
  OnDestroy,
  Renderer2,
  Signal,
} from '@angular/core';
import { DragDropContainerService } from '../injectables/drag-drop-container.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DragDataService } from '../injectables/drag-data.service';
import { DRAG_DROP_CLASS_NAMES } from '../injectables/drag-drop-class-names.token';
import { DragEndType } from '../types/drag-end-type.enum';

@Directive()
export abstract class DragItemBaseDirective implements AfterViewInit, OnDestroy {
  private _injector = inject(Injector);
  private _dragDataService = inject(DragDataService);
  private _dragDropContainer = inject(DragDropContainerService);
  private _classNames = inject(DRAG_DROP_CLASS_NAMES);
  private _zone = inject(NgZone);
  protected _renderer = inject(Renderer2);

  private stopListenMouseDown?: () => void;
  private stopListenDragStart?: () => void;
  private stopListenDragEnd?: () => void;

  private dragImage?: HTMLElement;

  private cleanupDragImage = this._dragDataService.dragEnd$
    .pipe(takeUntilDestroyed())
    .subscribe(() => (this.dragImage = undefined));

  abstract readonly dragNodeData: Signal<unknown>;

  abstract readonly dragDisabled: Signal<boolean>;

  abstract readonly dragExternalImage: Signal<HTMLElement | undefined>;

  abstract readonly elRef: Signal<ElementRef<HTMLElement>>;

  ngAfterViewInit(): void {
    effect(
      () => {
        this.elRef().nativeElement.draggable = !this.dragDisabled();
      },
      { injector: this._injector },
    );
    this._zone.runOutsideAngular(() => this.initListeners());
  }

  ngOnDestroy(): void {
    this.stopListenMouseDown?.();
    this.stopListenDragEnd?.();
    this.stopListenDragStart?.();
    this.dragImage = undefined;
  }

  private mouseDown(event: MouseEvent): void {
    if (this.dragDisabled()) {
      return;
    }
    // DOM manipulation inside the dragstart event, may cause
    // immediate firing of dragend event. To prevent it dragimage is created in mousedown handler
    this.dragImage = this._dragDataService.createDragImageForElement(
      this.dragExternalImage() ?? this.elRef().nativeElement,
      this._dragDropContainer,
    );
  }

  private dragStart(event: DragEvent): void {
    if (this.dragDisabled()) {
      return;
    }
    event.dataTransfer!.effectAllowed = 'move';
    if (this.dragImage) {
      event.dataTransfer!.setDragImage(this.dragImage, 15, 15);
    }
    this.elRef().nativeElement.classList.add(this._classNames.DRAG_IN_PROGRESS);
    this._zone.run(() => {
      this._dragDataService.dragStart(this.dragNodeData());
    });
  }

  private dragEnd(event: DragEvent): void {
    if (this.dragDisabled()) {
      return;
    }
    this.dragImage = undefined;
    this.elRef().nativeElement.classList.remove(this._classNames.DRAG_IN_PROGRESS);
    this._zone.run(() => {
      this._dragDataService.dragEnd(DragEndType.STOP);
    });
  }

  private initListeners(): void {
    const element = this.elRef().nativeElement;
    this.stopListenMouseDown = this._renderer.listen(element, 'mousedown', (event: MouseEvent) =>
      this.mouseDown(event),
    );
    this.stopListenDragStart = this._renderer.listen(element, 'dragstart', (event: DragEvent) => this.dragStart(event));
    this.stopListenDragEnd = this._renderer.listen(element, 'dragend', (event: DragEvent) => this.dragEnd(event));
  }
}
