import { ChangeDetectionStrategy, Component, computed, effect, inject, input, viewChild } from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { EntitySelectionState } from '../../injectables/selection/entity-selection-state';
import { SelectionList } from '../../injectables/selection/selection-list';
import { BulkSelectionType } from '../../types/bulk-selection-type.enum';
import { BulkSelectionLabelComponent } from '../bulk-selection-label/bulk-selection-label.component';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'step-bulk-selection',
  imports: [StepBasicsModule, BulkSelectionLabelComponent],
  templateUrl: './bulk-selection.component.html',
  styleUrl: './bulk-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkSelectionComponent<KEY, ENTITY> {
  private _selectionState = inject<EntitySelectionState<KEY, ENTITY>>(EntitySelectionState);
  private _selectionList = inject<SelectionList<KEY, ENTITY>>(SelectionList);

  private checkbox = viewChild('checkBox', { read: MatCheckbox });

  readonly showLabel = input(true);
  readonly isDisabled = input(false);

  private isChecked = computed(() => {
    const selectionType = this._selectionState.selectionType();
    return selectionType === BulkSelectionType.ALL;
  });

  private isIntermediate = computed(() => {
    const selectionType = this._selectionState.selectionType();
    const size = this._selectionState.selectedSize();
    if (selectionType === BulkSelectionType.ALL || selectionType === BulkSelectionType.NONE) {
      return false;
    }
    return size > 0;
  });

  private effectSyncCheckboxState = effect(() => {
    const checkbox = this.checkbox();
    const isChecked = this.isChecked();
    const isIntermediate = this.isIntermediate();
    if (!checkbox) {
      return;
    }
    if (isIntermediate) {
      checkbox.checked = false;
      checkbox.indeterminate = true;
    } else {
      checkbox.checked = isChecked;
      checkbox.indeterminate = false;
    }
  });

  protected handleCheckboxChange(): void {
    const selectionType = this._selectionState.selectionType();
    if (selectionType === BulkSelectionType.NONE) {
      this._selectionList.selectVisible();
    } else {
      this._selectionList.clearSelection();
    }
  }
}
