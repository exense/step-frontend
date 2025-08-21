import { Component, inject, viewChild } from '@angular/core';
import {
  AugmentedSchedulerService,
  BaseEntitySelectionTableComponent,
  entitySelectionStateProvider,
  ExecutiontTaskParameters,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-scheduler-task-selection',
  templateUrl: './scheduler-task-selection.component.html',
  styleUrls: ['./scheduler-task-selection.component.scss'],
  providers: [...entitySelectionStateProvider<string, ExecutiontTaskParameters>('id')],
  standalone: false,
})
export class SchedulerTaskSelectionComponent extends BaseEntitySelectionTableComponent {
  protected tableRef = viewChild('tableRef', { read: TableComponent<ExecutiontTaskParameters> });
  readonly _dataSource = inject(AugmentedSchedulerService).createDataSource();
}
