import { Component, computed, inject, signal } from '@angular/core';
import {
  AugmentedPlansService,
  CustomComponent,
  tableColumnsConfigProvider,
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
  private _plansApi = inject(AugmentedPlansService);

  private automationPackageId = signal<string | undefined>(undefined);

  protected readonly dataSource = computed(() => {
    const automationPackageId = this.automationPackageId();
    if (!automationPackageId) {
      return undefined;
    }
    return this._plansApi.getPlansTableDataSource(automationPackageId);
  });

  context?: string;

  contextChange(previousContext?: string, currentContext?: string) {
    this.automationPackageId.set(currentContext);
  }
}
