import { Component, forwardRef, inject } from '@angular/core';
import {
  AugmentedResourcesService,
  DialogParentService,
  EntityRefDirective,
  entitySelectionStateProvider,
  Resource,
  ResourceDialogsService,
  ResourceInputBridgeService,
  StepCoreModule,
  STORE_ALL,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { ResourceUrlPipe } from '../../pipes/resource-url.pipe';

@Component({
  selector: 'step-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss'],
  imports: [StepCoreModule, ResourceUrlPipe, EntityRefDirective],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedResourcesService.RESOURCES_TABLE_ID,
    }),
    tablePersistenceConfigProvider('resourceList', STORE_ALL),
    ...entitySelectionStateProvider<string, Resource>('id'),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => ResourcesListComponent),
    },
  ],
})
export class ResourcesListComponent implements DialogParentService {
  private _resourceDialogs = inject(ResourceDialogsService);
  private _resourcesService = inject(AugmentedResourcesService);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  readonly dataSource = this._resourcesService.createDataSource();

  readonly returnParentUrl = '/resources';

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  dialogNotSuccessfullyClosed(): void {
    this._resourceInputBridgeService.deleteUploadedResource();
  }

  protected deleteResource(id: string, label: string): void {
    this._resourceDialogs.deleteResource(id, label).subscribe(() => this.dataSource.reload());
  }

  protected downloadResource(id: string): void {
    this._resourceDialogs.downloadResource(id);
  }

  protected searchResource(resource: Resource): void {
    this._resourceDialogs.searchResource(resource);
  }
}
