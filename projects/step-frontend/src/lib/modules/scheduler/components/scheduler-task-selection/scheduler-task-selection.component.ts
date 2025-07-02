import { Component, inject, ViewChild } from '@angular/core';
import {
  AugmentedSchedulerService,
  AutoDeselectStrategy,
  BaseEntitySelectionTableComponent,
  ExecutiontTaskParameters,
  selectionCollectionProvider,
  SelectionCollector,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-scheduler-task-selection',
  templateUrl: './scheduler-task-selection.component.html',
  styleUrls: ['./scheduler-task-selection.component.scss'],
  providers: [
    ...selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
  standalone: false,
})
export class SchedulerTaskSelectionComponent extends BaseEntitySelectionTableComponent {
  @ViewChild('tableRef', { read: TableComponent })
  protected _tableRef?: TableComponent<ExecutiontTaskParameters>;
  protected _selectionCollector = inject<SelectionCollector<string, ExecutiontTaskParameters>>(SelectionCollector);
  readonly _dataSource = inject(AugmentedSchedulerService).createDataSource();
}
