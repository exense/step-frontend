import { Component, inject, viewChild } from '@angular/core';
import {
  AugmentedKeywordPackagesService,
  BaseEntitySelectionTableComponent,
  entitySelectionStateProvider,
  FunctionPackage,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-function-package-selection',
  templateUrl: 'function-package-selection.component.html',
  styleUrls: ['./function-package-selection.component.scss'],
  providers: [...entitySelectionStateProvider<string, FunctionPackage>('id')],
  standalone: false,
})
export class FunctionPackageSelectionComponent extends BaseEntitySelectionTableComponent {
  protected tableRef = viewChild('tableRef', { read: TableComponent<FunctionPackage> });
  readonly _dataSource = inject(AugmentedKeywordPackagesService).createSelectionDataSource();
}
