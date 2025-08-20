import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { EntitySelectionState } from '../../services/selection/entity-selection-state';
import { SelectionList } from '../../services/selection/selection-list';
import { BulkSelectionType } from '../../shared/bulk-selection-type.enum';
import { HasFilter } from '../../services/has-filter';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-bulk-sel-label',
  templateUrl: './bulk-sel-label.component.html',
  styleUrl: './bulk-sel-label.component.scss',
  imports: [StepBasicsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkSelLabelComponent<KEY, ENTITY> {
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
