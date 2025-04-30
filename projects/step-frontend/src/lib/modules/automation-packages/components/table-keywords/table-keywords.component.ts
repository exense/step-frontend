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
  selector: 'step-table-keywords',
  standalone: true,
  imports: [StepCommonModule],
  templateUrl: './table-keywords.component.html',
  styleUrl: './table-keywords.component.scss',
  providers: [
    TablePersistenceStateService,
    tableColumnsConfigProvider({
      entityTableRemoteId: 'automationPackagesKeywordTable',
      entityScreenId: 'keyword',
      entityScreenDefaultVisibleFields: ['attributes.name'],
      customColumnOptions: ['noEditorLink', 'noDescriptionHint'],
    }),
  ],
})
export class TableKeywordsComponent implements CustomComponent {
  protected readonly dataSource = signal<TableDataSource<AbstractOrganizableObject> | undefined>(undefined);

  context?: TableDataSource<AbstractOrganizableObject>;

  contextChange(
    previousContext?: TableDataSource<AbstractOrganizableObject>,
    currentContext?: TableDataSource<AbstractOrganizableObject>,
  ) {
    this.dataSource.set(currentContext);
  }
}
