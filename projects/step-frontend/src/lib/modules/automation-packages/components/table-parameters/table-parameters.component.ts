import { Component, computed, inject, signal } from '@angular/core';
import {
  AugmentedParametersService,
  CustomComponent,
  tableColumnsConfigProvider,
  TablePersistenceStateService,
} from '@exense/step-core';
import { ParameterModule } from '../../../parameter/parameter.module';
import { StepCommonModule } from '../../../_common/step-common.module';

@Component({
  selector: 'step-table-parameters',
  standalone: true,
  imports: [StepCommonModule, ParameterModule],
  templateUrl: './table-parameters.component.html',
  styleUrl: './table-parameters.component.scss',
  providers: [
    TablePersistenceStateService,
    tableColumnsConfigProvider({
      entityTableRemoteId: 'automationPackageParameters',
      entityScreenDefaultVisibleFields: ['attributes.name'],
      customColumnOptions: ['noEditorLink', 'noDescriptionHint'],
    }),
  ],
})
export class TableParametersComponent implements CustomComponent {
  private _parametersApi = inject(AugmentedParametersService);

  private automationPackageId = signal<string | undefined>(undefined);

  protected readonly dataSource = computed(() => {
    const automationPackageId = this.automationPackageId();
    if (!automationPackageId) {
      return undefined;
    }
    return this._parametersApi.createDataSource(automationPackageId);
  });

  context?: string;

  contextChange(previousContext?: string, currentContext?: string) {
    this.automationPackageId.set(currentContext);
  }
}
