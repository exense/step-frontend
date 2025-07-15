import { Component, inject, ViewChild } from '@angular/core';
import {
  AugmentedParametersService,
  AutoDeselectStrategy,
  BaseEntitySelectionTableComponent,
  Parameter,
  selectionCollectionProvider,
  SelectionCollector,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-parameter-selection',
  templateUrl: './parameter-selection.component.html',
  styleUrls: ['./parameter-selection.component.scss'],
  providers: [...selectionCollectionProvider<string, Parameter>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
  standalone: false,
})
export class ParameterSelectionComponent extends BaseEntitySelectionTableComponent {
  protected _selectionCollector = inject<SelectionCollector<string, Parameter>>(SelectionCollector);
  @ViewChild('tableRef', { read: TableComponent })
  protected _tableRef?: TableComponent<Parameter>;
  readonly _dataSource = inject(AugmentedParametersService).createSelectionDataSource();
}
