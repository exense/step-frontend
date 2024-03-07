import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import { DragDataService } from '../injectables/drag-data.service';
import { DropInfo } from '../types/drop-info';
import { DRAG_DROP_CLASS_NAMES } from '../injectables/drag-drop-class-names.token';
import { DragDropListener } from '../types/drag-drop-listener';

@Directive({
  selector: '[stepDropArea]',
  standalone: true,
})
export class DropAreaDirective implements AfterViewInit, OnDestroy {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _classNames = inject(DRAG_DROP_CLASS_NAMES);
  private _dragDataService = inject(DragDataService);
  private _zone = inject(NgZone);

  private dragOverListener?: DragDropListener;
  private dragLeaveListener?: DragDropListener;
  private dropListener?: DragDropListener;

  @Input('stepDropArea') dropArea?: unknown;
  @Input() dropAdditionalInfo?: unknown;
  @Output() dropItem = new EventEmitter<DropInfo>();

  ngAfterViewInit(): void {
    this.initListeners();
  }

  ngOnDestroy(): void {
    this.destroyListeners();
  }

  private dragOver(event: DragEvent): void {
    if (
      !this._dragDataService.isDragStarted ||
      this._elRef.nativeElement.classList.contains(this._classNames.DRAG_IN_PROGRESS) ||
      (!!this.dropArea && this.dropArea === this._dragDataService.dragData)
    ) {
      return;
    }
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this._elRef.nativeElement.classList.add(this._classNames.DRAG_OVER);
  }

  private dragLeave(event: DragEvent): void {
    this._elRef.nativeElement.classList.remove(this._classNames.DRAG_OVER);
  }

  private drop(event: DragEvent): void {
    event.preventDefault();
    this._zone.run(() => {
      this.dropItem.emit({
        draggedElement: this._dragDataService.dragData,
        droppedArea: this.dropArea,
        additionalInfo: this.dropAdditionalInfo,
      });
    });
  }

  private initListeners(): void {
    this._zone.runOutsideAngular(() => {
      this.dragOverListener = (event) => this.dragOver(event);
      this.dragLeaveListener = (event) => this.dragLeave(event);
      this.dropListener = (event) => this.drop(event);
      this._elRef.nativeElement.addEventListener('dragover', this.dragOverListener);
      this._elRef.nativeElement.addEventListener('dragleave', this.dragLeaveListener);
      this._elRef.nativeElement.addEventListener('drop', this.dropListener);
    });
  }

  private destroyListeners(): void {
    this._zone.runOutsideAngular(() => {
      if (this.dragOverListener) {
        this._elRef.nativeElement.removeEventListener('dragover', this.dragOverListener);
        this.dragOverListener = undefined;
      }
      if (this.dragLeaveListener) {
        this._elRef.nativeElement.removeEventListener('dragleave', this.dragLeaveListener);
        this.dragLeaveListener = undefined;
      }
      if (this.dropListener) {
        this._elRef.nativeElement.removeEventListener('drop', this.dropListener);
        this.dropListener = undefined;
      }
    });
  }
}
