import { Component, signal } from '@angular/core';
import {
  AbstractOrganizableObject,
  CustomComponent,
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
export class TableTasksComponent implements CustomComponent {
  protected readonly dataSource = signal<TableDataSource<AbstractOrganizableObject> | undefined>(undefined);

  context?: TableDataSource<AbstractOrganizableObject>;

  contextChange(
    previousContext?: TableDataSource<AbstractOrganizableObject>,
    currentContext?: TableDataSource<AbstractOrganizableObject>,
  ) {
    this.dataSource.set(currentContext);
  }
}
