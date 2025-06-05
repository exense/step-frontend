import { Component, inject, ViewChild } from '@angular/core';
import {
  AugmentedKeywordPackagesService,
  AutoDeselectStrategy,
  BaseEntitySelectionTableComponent,
  FunctionPackage,
  selectionCollectionProvider,
  SelectionCollector,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-function-package-selection',
  templateUrl: 'function-package-selection.component.html',
  styleUrls: ['./function-package-selection.component.scss'],
  providers: [
    ...selectionCollectionProvider<string, FunctionPackage>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
  standalone: false,
})
export class FunctionPackageSelectionComponent extends BaseEntitySelectionTableComponent {
  protected _selectionCollector = inject<SelectionCollector<string, FunctionPackage>>(SelectionCollector);

  @ViewChild('tableRef', { read: TableComponent })
  protected _tableRef?: TableComponent<FunctionPackage>;

  readonly _dataSource = inject(AugmentedKeywordPackagesService).createSelectionDataSource();
}
