import { Component, input } from '@angular/core';
import {
  AbstractOrganizableObject,
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
export class TableKeywordsComponent {
  readonly dataSource = input.required<TableDataSource<AbstractOrganizableObject>>();
}
