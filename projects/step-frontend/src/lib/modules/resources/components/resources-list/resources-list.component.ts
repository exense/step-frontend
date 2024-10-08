import { Component, forwardRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Import de ActivatedRoute
import {
  AugmentedParametersService,
  AugmentedResourcesService,
  AutoDeselectStrategy,
  DialogParentService,
  Resource,
  ResourceDialogsService,
  ResourceInputBridgeService,
  selectionCollectionProvider,
  STORE_ALL,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
} from '@exense/step-core';

@Component({
  selector: 'step-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedResourcesService.RESOURCES_TABLE_ID,
    }),
    tablePersistenceConfigProvider('resourceList', STORE_ALL),
    ...selectionCollectionProvider<string, Resource>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
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
  private route = inject(ActivatedRoute); // Injection de ActivatedRoute

  readonly dataSource = this._resourcesService.createDataSource();
  readonly returnParentUrl = '/resources';

  isTenantAll(): boolean {
    const tenant = this.route.snapshot.queryParams['tenant'];
    return tenant == '[All]';
  }

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
