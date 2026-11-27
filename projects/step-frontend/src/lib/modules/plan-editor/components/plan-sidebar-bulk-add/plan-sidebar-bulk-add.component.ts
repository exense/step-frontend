import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { BulkSelectionType, EntitySelectionState, HasFilter, SelectionList } from '@exense/step-core';
import { StepCommonModule } from '../../../_common/step-common.module';

@Component({
  selector: 'step-plan-sidebar-bulk-add',
  imports: [StepCommonModule],
  templateUrl: './plan-sidebar-bulk-add.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanSidebarBulkAddComponent {
  readonly item = input.required<'keyword' | 'plan'>();
  readonly add = output<void>();
  private readonly selection = inject(EntitySelectionState);
  protected readonly selectedCount = this.selection.selectedSize;
  protected readonly selectionType = this.selection.selectionType;
  protected readonly types = BulkSelectionType;
  protected readonly list = inject(SelectionList);
  protected readonly filter = inject(HasFilter);
}
