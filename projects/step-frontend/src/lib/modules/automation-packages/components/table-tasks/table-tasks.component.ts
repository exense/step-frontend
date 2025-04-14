import { Component, input } from '@angular/core';
import {
  AbstractOrganizableObject,
  tableColumnsConfigProvider,
  TableDataSource,
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
export class TableTasksComponent {
  readonly dataSource = input.required<TableDataSource<AbstractOrganizableObject>>();
}
