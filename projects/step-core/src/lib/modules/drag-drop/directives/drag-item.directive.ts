import {
  AfterViewInit,
  Directive,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { DragDataService } from '../injectables/drag-data.service';
import { DRAG_DROP_CLASS_NAMES } from '../injectables/drag-drop-class-names.token';
import { DragDropListener } from '../types/drag-drop-listener';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DragDropContainerService } from '../injectables/drag-drop-container.service';
import { DragEndType } from '../types/drag-end-type.enum';

@Directive({
  selector: '[stepDragItem]',
  standalone: true,
})
export class DragItemDirective implements AfterViewInit, OnDestroy {
  private _injector = inject(Injector);
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _dragDataService = inject(DragDataService);
  private _dragDropContainer = inject(DragDropContainerService);
  private _classNames = inject(DRAG_DROP_CLASS_NAMES);
  private _zone = inject(NgZone);

  private mouseDownListener?: (event: MouseEvent) => void;
  private dragStartListener?: DragDropListener;
  private dragEndListener?: DragDropListener;
  private dragImage?: HTMLElement;

  private cleanupDragImage = this._dragDataService.dragEnd$
    .pipe(takeUntilDestroyed())
    .subscribe(() => (this.dragImage = undefined));

  /** @Input() **/
  dragNodeData = input<unknown>(undefined, { alias: 'stepDragItem' });

  /** @Input() **/
  dragDisabled = input(false);

  /** @Input() **/
  dragExternalImage = input<HTMLElement | undefined>(undefined, { alias: 'dragImage' });

  ngAfterViewInit(): void {
    effect(
      () => {
        this._elRef.nativeElement.draggable = !this.dragDisabled();
      },
      { injector: this._injector },
    );
    this.initListeners();
  }

  ngOnDestroy(): void {
    this.destroyListeners();
    this.dragImage = undefined;
  }

  private mouseDown(event: MouseEvent): void {
    if (this.dragDisabled()) {
      return;
    }
    // DOM manipulation inside the dragstart event, may cause
    // immediate firing of dragend event. To prevent it dragimage is created in mousedown handler
    this.dragImage = this._dragDataService.createDragImageForElement(
      this.dragExternalImage() ?? this._elRef.nativeElement,
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
    this._elRef.nativeElement.classList.add(this._classNames.DRAG_IN_PROGRESS);
    this._zone.run(() => {
      this._dragDataService.dragStart(this.dragNodeData());
    });
  }

  private dragEnd(event: DragEvent): void {
    if (this.dragDisabled()) {
      return;
    }
    this.dragImage = undefined;
    this._elRef.nativeElement.classList.remove(this._classNames.DRAG_IN_PROGRESS);
    this._zone.run(() => {
      this._dragDataService.dragEnd(DragEndType.STOP);
    });
  }

  private initListeners(): void {
    this._zone.runOutsideAngular(() => {
      this.mouseDownListener = (event) => this.mouseDown(event);
      this._elRef.nativeElement.addEventListener('mousedown', this.mouseDownListener);
      this.dragStartListener = (event) => this.dragStart(event);
      this._elRef.nativeElement.addEventListener('dragstart', this.dragStartListener);
      this.dragEndListener = (event) => this.dragEnd(event);
      this._elRef.nativeElement.addEventListener('dragend', this.dragEndListener);
    });
  }

  private destroyListeners(): void {
    this._zone.runOutsideAngular(() => {
      if (this.mouseDownListener) {
        this._elRef.nativeElement.removeEventListener('mousedown', this.mouseDownListener);
        this.mouseDownListener = undefined;
      }
      if (this.dragStartListener) {
        this._elRef.nativeElement.removeEventListener('dragstart', this.dragStartListener);
        this.dragStartListener = undefined;
      }
      if (this.dragEndListener) {
        this._elRef.nativeElement.removeEventListener('dragend', this.dragEndListener);
        this.dragEndListener = undefined;
      }
    });
  }
}
