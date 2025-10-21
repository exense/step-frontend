import { Component, effect, ElementRef, input, OnDestroy, untracked } from '@angular/core';
import { DragItemBaseDirective } from '../../directives/drag-item-base.directive';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, pairwise, startWith } from 'rxjs';

const DRAG_ITEM_CLASS = 'step-draggable-item';
const DRAG_ITEM_DISABLED = 'step-draggable-item-disabled';

@Component({
  selector: 'step-drag-item',
  template: '',
})
export class DragItemComponent extends DragItemBaseDirective implements OnDestroy {
  override readonly elRef = input.required<ElementRef<HTMLElement>>();
  override readonly dragNodeData = input<unknown>(undefined, { alias: 'data' });
  override readonly dragDisabled = input(false);
  override readonly dragExternalImage = input<HTMLElement | undefined>(undefined, { alias: 'dragImage' });

  private markElRefAsDraggableSubscription = toObservable(this.elRef)
    .pipe(startWith(undefined), distinctUntilChanged(), pairwise(), takeUntilDestroyed())
    .subscribe(([prev, current]) => {
      const isDisabled = untracked(() => this.dragDisabled());
      if (prev?.nativeElement) {
        this._renderer.removeClass(prev.nativeElement, DRAG_ITEM_CLASS);
        this._renderer.removeClass(prev.nativeElement, DRAG_ITEM_DISABLED);
      }
      if (current?.nativeElement) {
        this._renderer.addClass(current.nativeElement, DRAG_ITEM_CLASS);
        if (isDisabled) {
          this._renderer.addClass(current.nativeElement, DRAG_ITEM_DISABLED);
        }
      }
    });

  private effectDisabledChange = effect(() => {
    const isDisabled = this.dragDisabled();
    const elRef = untracked(() => this.elRef());
    if (isDisabled) {
      this._renderer.addClass(elRef.nativeElement, DRAG_ITEM_DISABLED);
    } else {
      this._renderer.removeClass(elRef.nativeElement, DRAG_ITEM_DISABLED);
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
