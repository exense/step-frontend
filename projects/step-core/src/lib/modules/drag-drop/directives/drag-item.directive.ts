import { Directive, ElementRef, inject, input, signal } from '@angular/core';
import { DragItemBaseDirective } from './drag-item-base.directive';

@Directive({
  selector: '[stepDragItem]',
})
export class DragItemDirective extends DragItemBaseDirective {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);

  override readonly elRef = signal(this._elRef).asReadonly();

  /** @Input() **/
  override readonly dragNodeData = input<unknown>(undefined, { alias: 'stepDragItem' });

  /** @Input() **/
  override readonly dragDisabled = input(false);

  /** @Input() **/
  override readonly dragExternalImage = input<HTMLElement | undefined>(undefined, { alias: 'dragImage' });
}
