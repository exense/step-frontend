import { Component, computed, inject, signal } from '@angular/core';
import {
  AugmentedKeywordsService,
  CustomComponent,
  STORE_ALL,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
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
    tablePersistenceConfigProvider('automationPackagesKeywordTable', STORE_ALL),
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
  private _keywordsApi = inject(AugmentedKeywordsService);

  private automationPackageId = signal<string | undefined>(undefined);

  protected readonly dataSource = computed(() => {
    const automationPackageId = this.automationPackageId();
    if (!automationPackageId) {
      return undefined;
    }
    return this._keywordsApi.createFilteredTableDataSource(undefined, automationPackageId);
  });

  context?: string;

  contextChange(previousContext?: string, currentContext?: string) {
    this.automationPackageId.set(currentContext);
  }
}
