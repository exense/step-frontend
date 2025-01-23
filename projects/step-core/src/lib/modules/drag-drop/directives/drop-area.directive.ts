import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  output,
  Renderer2,
} from '@angular/core';
import { DragDataService } from '../injectables/drag-data.service';
import { DropInfo } from '../types/drop-info';
import { DRAG_DROP_CLASS_NAMES } from '../injectables/drag-drop-class-names.token';
import { DragEndType } from '../types/drag-end-type.enum';

@Directive({
  selector: '[stepDropArea]',
  standalone: true,
})
export class DropAreaDirective implements AfterViewInit, OnDestroy {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _classNames = inject(DRAG_DROP_CLASS_NAMES);
  private _dragDataService = inject(DragDataService);
  private _renderer = inject(Renderer2);
  private _zone = inject(NgZone);

  private stopListenDragOver?: () => void;
  private stopListenDragLeave?: () => void;
  private stopListenDrop?: () => void;

  /** @Input('stepDropArea') **/
  readonly dropArea = input<unknown | undefined>(undefined, { alias: 'stepDropArea' });

  /** @Input() **/
  readonly dropAdditionalInfo = input<unknown | undefined>(undefined);

  /** @Input() **/
  readonly dropDisabled = input(false);

  /** @Output() **/
  readonly dropItem = output<DropInfo>();

  /** @Output() **/
  readonly dragOver = output<DropInfo>();

  /** @Output() **/
  readonly dragLeave = output<DropInfo>();

  ngAfterViewInit(): void {
    this.initListeners();
    this._zone.runOutsideAngular(() => this.initListeners());
  }

  ngOnDestroy(): void {
    this.stopListenDragOver?.();
    this.stopListenDragLeave?.();
    this.stopListenDrop?.();
  }

  private handleDragOver(event: DragEvent): void {
    if (
      this.dropDisabled() ||
      !this._dragDataService.isDragStarted ||
      this._elRef.nativeElement.classList.contains(this._classNames.DRAG_IN_PROGRESS) ||
      (!!this.dropArea() && this.dropArea() === this._dragDataService.dragData)
    ) {
      return;
    }
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this._elRef.nativeElement.classList.add(this._classNames.DRAG_OVER);
    this.dragOver.emit(this.getDropInfo());
  }

  private handleDragLeave(event: DragEvent): void {
    if (this.dropDisabled()) {
      return;
    }
    this._elRef.nativeElement.classList.remove(this._classNames.DRAG_OVER);
    this.dragLeave.emit(this.getDropInfo());
  }

  private handleDrop(event: DragEvent): void {
    if (this.dropDisabled()) {
      return;
    }
    event.preventDefault();
    this._zone.run(() => {
      this.dropItem.emit(this.getDropInfo());
      this._dragDataService.dragEnd(DragEndType.DROP);
    });
  }

  private getDropInfo(): DropInfo {
    return {
      draggedElement: this._dragDataService.dragData,
      droppedArea: this.dropArea(),
      additionalInfo: this.dropAdditionalInfo(),
    };
  }

  private initListeners(): void {
    const element = this._elRef.nativeElement;
    this.stopListenDragOver = this._renderer.listen(element, 'dragover', (event: DragEvent) =>
      this.handleDragOver(event),
    );
    this.stopListenDragLeave = this._renderer.listen(element, 'dragleave', (event: DragEvent) =>
      this.handleDragLeave(event),
    );
    this.stopListenDrop = this._renderer.listen(element, 'drop', (event: DragEvent) => this.handleDrop(event));
  }
}
