import { Component, inject, ViewChild } from '@angular/core';
import {
  AugmentedResourcesService,
  AutoDeselectStrategy,
  BaseEntitySelectionTableComponent,
  FunctionPackage,
  Resource,
  selectionCollectionProvider,
  SelectionCollector,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-resource-selection',
  templateUrl: './resource-selection.component.html',
  styleUrls: ['./resource-selection.component.scss'],
  providers: [...selectionCollectionProvider<string, Resource>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
  standalone: false,
})
export class ResourceSelectionComponent extends BaseEntitySelectionTableComponent {
  @ViewChild('tableRef', { read: TableComponent })
  protected _tableRef?: TableComponent<Resource>;
  protected _selectionCollector = inject<SelectionCollector<string, FunctionPackage>>(SelectionCollector);
  readonly _dataSource = inject(AugmentedResourcesService).createSelectionDataSource();
}
