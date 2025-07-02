import { Component, ElementRef, input, OnDestroy } from '@angular/core';
import { DragItemBaseDirective } from '../../directives/drag-item-base.directive';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, pairwise, startWith } from 'rxjs';

const DRAG_ITEM_CLASS = 'step-draggable-item';

@Component({
  selector: 'step-drag-item',
  template: '',
})
export class DragItemComponent extends DragItemBaseDirective implements OnDestroy {
  /** @Input() **/
  override readonly elRef = input.required<ElementRef<HTMLElement>>();

  /** @Input() **/
  override readonly dragNodeData = input<unknown>(undefined, { alias: 'data' });

  /** @Input() **/
  override readonly dragDisabled = input(false);

  /** @Input() **/
  override readonly dragExternalImage = input<HTMLElement | undefined>(undefined, { alias: 'dragImage' });

  private markElRefAsDraggableSubscription = toObservable(this.elRef)
    .pipe(startWith(undefined), distinctUntilChanged(), pairwise(), takeUntilDestroyed())
    .subscribe(([prev, current]) => {
      if (prev?.nativeElement) {
        this._renderer.removeClass(prev.nativeElement, DRAG_ITEM_CLASS);
      }
      if (current?.nativeElement) {
        this._renderer.addClass(current.nativeElement, DRAG_ITEM_CLASS);
      }
    });

  override ngOnDestroy() {
    super.ngOnDestroy();
    const elRef = this.elRef();
    if (elRef?.nativeElement) {
      this._renderer.removeClass(elRef.nativeElement, DRAG_ITEM_CLASS);
    }
  }
}
