import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { EntitySelectionState } from '../../injectables/selection/entity-selection-state';
import { SelectionList } from '../../injectables/selection/selection-list';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-entity-selection',
  templateUrl: './entity-selection.component.html',
  styleUrls: ['./entity-selection.component.scss'],
  imports: [StepBasicsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntitySelectionComponent<KEY, ENTITY> {
  private _selectionState = inject<EntitySelectionState<KEY, ENTITY>>(EntitySelectionState, { optional: true });
  private _selectionList = inject<SelectionList<KEY, ENTITY>>(SelectionList, { optional: true });

  readonly entity = input<ENTITY | undefined>(undefined);

  protected readonly isSelected = computed(() => {
    const keys = this._selectionState?.selectedKeys?.();
    const entity = this.entity();
    return !entity ? undefined : this._selectionState?.isSelected?.(entity);
  });

  toggle(): void {
    const entity = this.entity();
    if (!entity) {
      return;
    }
    this._selectionList?.toggleSelection?.(entity);
  }
}
