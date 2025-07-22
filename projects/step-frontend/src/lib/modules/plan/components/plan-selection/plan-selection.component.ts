import { Component, inject, ViewChild } from '@angular/core';
import {
  AugmentedPlansService,
  AutoDeselectStrategy,
  BaseEntitySelectionTableComponent,
  Plan,
  selectionCollectionProvider,
  SelectionCollector,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-plan-selection',
  templateUrl: './plan-selection.component.html',
  styleUrls: ['./plan-selection.component.scss'],
  providers: [...selectionCollectionProvider<string, Plan>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
  standalone: false,
})
export class PlanSelectionComponent extends BaseEntitySelectionTableComponent {
  protected _selectionCollector = inject<SelectionCollector<string, Plan>>(SelectionCollector);
  @ViewChild('tableRef', { read: TableComponent })
  protected _tableRef?: TableComponent<Plan>;
  readonly _dataSource = inject(AugmentedPlansService).createSelectionDataSource();
}
