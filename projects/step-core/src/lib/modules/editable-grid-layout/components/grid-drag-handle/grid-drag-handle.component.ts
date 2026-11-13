import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { GridDragHandleDirective } from '../../directives/grid-drag-handle.directive';
import { GridEditableService } from '../../injectables/grid-editable.service';
import { GridElementHeaderActionsComponent } from '../grid-element-header-actions/grid-element-header-actions.component';
import { GridElementRemoveComponent } from '../grid-element-remove/grid-element-remove.component';
import { GridElementTitleComponent } from '../grid-element-title/grid-element-title.component';

@Component({
  selector: 'step-grid-drag-handle',
  imports: [StepBasicsModule, GridElementHeaderActionsComponent, GridElementRemoveComponent, GridElementTitleComponent],
  templateUrl: './grid-drag-handle.component.html',
  styleUrl: './grid-drag-handle.component.scss',
  hostDirectives: [GridDragHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridDragHandleComponent {
  private readonly _gridEditable = inject(GridEditableService);

  readonly conditionDescription = input<string | undefined>(undefined);

  protected readonly visibleConditionDescription = computed(() => {
    const isEditMode = this._gridEditable.editMode();
    const description = this.conditionDescription();
    return isEditMode ? description : undefined;
  });
}
