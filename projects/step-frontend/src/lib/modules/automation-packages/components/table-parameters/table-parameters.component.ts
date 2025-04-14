import { Component, input } from '@angular/core';
import {
  AbstractOrganizableObject,
  tableColumnsConfigProvider,
  TableDataSource,
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
export class TableParametersComponent {
  readonly dataSource = input.required<TableDataSource<AbstractOrganizableObject>>();
}
