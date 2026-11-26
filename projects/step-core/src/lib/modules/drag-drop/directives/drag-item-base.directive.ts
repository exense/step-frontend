import {
  AfterViewInit,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
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
import { DragPickupPreviewService } from '../injectables/drag-pickup-preview.service';

@Directive()
export abstract class DragItemBaseDirective implements AfterViewInit, OnDestroy {
  private _injector = inject(Injector);
  private readonly _pickupPreview = inject(DragPickupPreviewService);
  private _dragDataService = inject(DragDataService);
  private _dragDropContainer = inject(DragDropContainerService);
  private _classNames = inject(DRAG_DROP_CLASS_NAMES);
  private _zone = inject(NgZone);
  protected _renderer = inject(Renderer2);

  private stopListenMouseDown?: () => void;
  private stopListenDragStart?: () => void;
  private stopListenDragEnd?: () => void;

  private dragImage?: HTMLElement;
  private isDragging = false;

  private cleanupDragImage = this._dragDataService.dragEnd$.pipe(takeUntilDestroyed()).subscribe(() => {
    this.dragImage = undefined;
    this._pickupPreview.clearFor(this.elRef().nativeElement);
  });

  abstract readonly dragNodeData: Signal<unknown>;

  abstract readonly dragDisabled: Signal<boolean>;

  abstract readonly dragExternalImage: Signal<HTMLElement | undefined>;

  abstract readonly elRef: Signal<ElementRef<HTMLElement>>;

  readonly dragPreviewOrigin = input<HTMLElement>();

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
    this._pickupPreview.clearFor(this.elRef().nativeElement);
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
    if (this._dragDropContainer.animatedPreview?.()) {
      this.dragImage = this._pickupPreview.prepare({
        source: this.elRef().nativeElement,
        template: this.dragImage,
        origin: this.dragPreviewOrigin(),
        onCancel: () => this.dragEnd(),
      });
    }
  }

  private dragStart(event: DragEvent): void {
    if (this.dragDisabled()) {
      return;
    }
    this.isDragging = true;
    event.dataTransfer!.effectAllowed = 'move';
    if (this.dragImage) {
      const offset = this._dragDropContainer.animatedPreview?.() ? 0 : 15;
      event.dataTransfer!.setDragImage(this.dragImage, offset, offset);
    }
    this.elRef().nativeElement.classList.add(this._classNames.DRAG_IN_PROGRESS);
    this._zone.run(() => {
      this._dragDataService.dragStart(this.dragNodeData());
    });
    if (this._dragDropContainer.animatedPreview?.()) {
      this._pickupPreview.start(this.elRef().nativeElement, event);
    }
  }

  private dragEnd(): void {
    if (!this.isDragging) {
      return;
    }
    this.isDragging = false;
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
    this.stopListenDragEnd = this._renderer.listen(element, 'dragend', () => this.dragEnd());
  }
}
