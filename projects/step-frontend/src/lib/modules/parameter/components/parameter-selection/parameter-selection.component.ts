import { Component, inject, viewChild } from '@angular/core';
import {
  AugmentedParametersService,
  BaseEntitySelectionTableComponent,
  entitySelectionStateProvider,
  Parameter,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-parameter-selection',
  templateUrl: './parameter-selection.component.html',
  styleUrls: ['./parameter-selection.component.scss'],
  providers: [...entitySelectionStateProvider<string, Parameter>('id')],
  standalone: false,
})
export class ParameterSelectionComponent extends BaseEntitySelectionTableComponent {
  protected tableRef = viewChild('tableRef', { read: TableComponent<Parameter> });
  readonly _dataSource = inject(AugmentedParametersService).createSelectionDataSource();
}
