import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { EntitySelectionState } from '../../injectables/selection/entity-selection-state';
import { SelectionList } from '../../injectables/selection/selection-list';
import { BulkSelectionType } from '../../types/bulk-selection-type.enum';
import { HasFilter } from '../../injectables/has-filter';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-bulk-selection-label',
  templateUrl: './bulk-selection-label.component.html',
  styleUrl: './bulk-selection-label.component.scss',
  imports: [StepBasicsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkSelectionLabelComponent<KEY, ENTITY> {
  private _selectionState = inject<EntitySelectionState<KEY, ENTITY>>(EntitySelectionState);
  private _selectionList = inject<SelectionList<KEY, ENTITY>>(SelectionList);

  protected readonly _hasFilter = inject(HasFilter, { optional: true });

  protected readonly selectionType = this._selectionState.selectionType;
  protected readonly size = this._selectionState.selectedSize;

  protected readonly BulkSelectionType = BulkSelectionType;

  readonly isDisabled = input(false);

  protected selectAll(): void {
    if (this.isDisabled()) {
      return;
    }
    this._selectionList.selectAll();
  }

  protected selectFiltered(): void {
    if (this.isDisabled()) {
      return;
    }
    this._selectionList.selectFiltered();
  }
}
