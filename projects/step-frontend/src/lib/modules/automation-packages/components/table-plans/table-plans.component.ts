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
  selector: 'step-table-plans',
  standalone: true,
  imports: [StepCommonModule],
  templateUrl: './table-plans.component.html',
  styleUrl: './table-plans.component.scss',
  providers: [
    TablePersistenceStateService,
    tableColumnsConfigProvider({
      entityTableRemoteId: 'automationPackagesPlanTable',
      entityScreenId: 'plan',
      entityScreenDefaultVisibleFields: ['attributes.name'],
      customColumnOptions: ['noEditorLink', 'noDescriptionHint'],
    }),
  ],
})
export class TablePlansComponent implements CustomComponent {
  protected readonly dataSource = signal<TableDataSource<AbstractOrganizableObject> | undefined>(undefined);

  context?: TableDataSource<AbstractOrganizableObject>;

  contextChange(
    previousContext?: TableDataSource<AbstractOrganizableObject>,
    currentContext?: TableDataSource<AbstractOrganizableObject>,
  ) {
    this.dataSource.set(currentContext);
  }
}
