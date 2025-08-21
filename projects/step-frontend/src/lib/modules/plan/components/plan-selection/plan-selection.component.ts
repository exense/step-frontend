import { Component, inject, viewChild } from '@angular/core';
import {
  AugmentedPlansService,
  BaseEntitySelectionTableComponent,
  entitySelectionStateProvider,
  Plan,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-plan-selection',
  templateUrl: './plan-selection.component.html',
  styleUrls: ['./plan-selection.component.scss'],
  providers: [...entitySelectionStateProvider<string, Plan>('id')],
  standalone: false,
})
export class PlanSelectionComponent extends BaseEntitySelectionTableComponent {
  protected tableRef = viewChild('tableRef', { read: TableComponent<Plan> });
  readonly _dataSource = inject(AugmentedPlansService).createSelectionDataSource();
}
