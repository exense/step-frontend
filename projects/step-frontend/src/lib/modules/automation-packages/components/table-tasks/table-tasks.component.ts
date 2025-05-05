import { Component, computed, inject, signal } from '@angular/core';
import {
  AugmentedSchedulerService,
  CustomComponent,
  STORE_ALL,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
  TablePersistenceStateService,
} from '@exense/step-core';
import { StepCommonModule } from '../../../_common/step-common.module';

@Component({
  selector: 'step-table-tasks',
  standalone: true,
  imports: [StepCommonModule],
  templateUrl: './table-tasks.component.html',
  styleUrl: './table-tasks.component.scss',
  providers: [
    tablePersistenceConfigProvider('automationPackagesTasksTable', STORE_ALL),
    TablePersistenceStateService,
    tableColumnsConfigProvider({
      entityTableRemoteId: 'automationPackagesTasksTable',
      entityScreenId: 'executionParameters',
      entityScreenSubPath: 'executionsParameters.customParameters',
      entityScreenDefaultVisibleFields: ['attributes.name'],
      customColumnOptions: ['noEditorLink', 'noDescriptionHint'],
    }),
  ],
})
export class TableTasksComponent implements CustomComponent {
  private _tasksApi = inject(AugmentedSchedulerService);

  private automationPackageId = signal<string | undefined>(undefined);

  protected readonly dataSource = computed(() => {
    const automationPackageId = this.automationPackageId();
    if (!automationPackageId) {
      return undefined;
    }
    return this._tasksApi.createDataSource(automationPackageId);
  });

  context?: string;

  contextChange(previousContext?: string, currentContext?: string) {
    this.automationPackageId.set(currentContext);
  }
}
