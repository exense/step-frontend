import { Component, inject, viewChild } from '@angular/core';
import {
  AugmentedResourcesService,
  AutoDeselectStrategy,
  BaseEntitySelectionTableComponent,
  FunctionPackage,
  Resource,
  selectionCollectionProvider,
  SelectionCollector,
  StepCoreModule,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-resource-selection',
  templateUrl: './resource-selection.component.html',
  styleUrls: ['./resource-selection.component.scss'],
  imports: [StepCoreModule],
  providers: [...selectionCollectionProvider<string, Resource>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
})
export class ResourceSelectionComponent extends BaseEntitySelectionTableComponent {
  private tableRef = viewChild('tableRef', { read: TableComponent<Resource> });

  protected get _tableRef(): TableComponent<Resource> | undefined {
    return this.tableRef();
  }

  protected _selectionCollector = inject<SelectionCollector<string, FunctionPackage>>(SelectionCollector);
  readonly _dataSource = inject(AugmentedResourcesService).createSelectionDataSource();
}
