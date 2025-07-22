import { computed, Directive, effect, ElementRef, inject, Renderer2 } from '@angular/core';
import { MultiLevelVisualSelectionService } from '../injectables/multi-level-visual-selection.service';
import { MatOption } from '@angular/material/autocomplete';
import { SelectionState } from '../types/selection-state.enum';

const CLASS_INDETERMINATE = 'mat-pseudo-checkbox-indeterminate';
const CLASS_CHECKED = 'mat-pseudo-checkbox-checked';

@Directive({
  selector: 'mat-option.step-multi-level-plain-item',
})
export class MultiSelectOptionDirective<T extends string | number | symbol> {
  private _state = inject<MultiLevelVisualSelectionService<T>>(MultiLevelVisualSelectionService);
  private _matOption = inject<MatOption<T>>(MatOption, { self: true });
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _renderer = inject(Renderer2);

  private effSelectionChange = effect(() => {
    const selectionState = this._state.visualSelectionState()[this._matOption.value];
    const checkbox = this._elRef.nativeElement.querySelector('mat-pseudo-checkbox');
    if (!checkbox) {
      return;
    }
    setTimeout(() => this.assignSelectionClassed(checkbox, selectionState));
  });

  private assignSelectionClassed(checkbox: Element, state: SelectionState): void {
    this._renderer.removeClass(checkbox, CLASS_CHECKED);
    this._renderer.removeClass(checkbox, CLASS_INDETERMINATE);
    switch (state) {
      case SelectionState.SELECTED:
        this._renderer.addClass(checkbox, CLASS_CHECKED);
        break;
      case SelectionState.CHILD_SELECTED:
        this._renderer.addClass(checkbox, CLASS_INDETERMINATE);
        break;
      default:
        break;
    }
  }
}
