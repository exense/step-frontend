import { Component, inject, viewChild } from '@angular/core';
import {
  AugmentedResourcesService,
  BaseEntitySelectionTableComponent,
  entitySelectionStateProvider,
  Resource,
  StepCoreModule,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-resource-selection',
  templateUrl: './resource-selection.component.html',
  styleUrls: ['./resource-selection.component.scss'],
  imports: [StepCoreModule],
  providers: [...entitySelectionStateProvider<string, Resource>('id')],
})
export class ResourceSelectionComponent extends BaseEntitySelectionTableComponent {
  protected tableRef = viewChild('tableRef', { read: TableComponent<Resource> });
  readonly _dataSource = inject(AugmentedResourcesService).createSelectionDataSource();
}
