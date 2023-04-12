import { Component, inject, ViewChild } from '@angular/core';
import {
  AutoDeselectStrategy,
  BaseEntitySelectionTableComponent,
  FunctionPackage,
  selectionCollectionProvider,
  SelectionCollector,
  TableApiWrapperService, TableComponent,
  TableRemoteDataSource,
} from '@exense/step-core';

@Component({
  selector: 'step-function-package-selection',
  templateUrl: 'function-package-selection.component.html',
  styleUrls: ['./function-package-selection.component.scss'],
  providers: [selectionCollectionProvider<string, FunctionPackage>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
})
export class FunctionPackageSelectionComponent extends BaseEntitySelectionTableComponent {

  private _api = inject(TableApiWrapperService);

  protected _selectionCollector = inject(SelectionCollector<string, FunctionPackage>);

  @ViewChild('tableRef', {read: TableComponent})
  protected _tableRef?: TableComponent<FunctionPackage>;

  readonly dataSource = new TableRemoteDataSource<FunctionPackage>('functionPackage', this._api, {
    'attributes.name': 'attributes.name',
    packageLocation: 'packageLocation',
    'packageAttributes.version': 'packageAttributes.version',
  });

}
