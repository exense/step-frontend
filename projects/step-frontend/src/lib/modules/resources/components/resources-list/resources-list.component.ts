import { Component, forwardRef, inject } from '@angular/core';
import {
  AugmentedResourcesService,
  AutoDeselectStrategy,
  DialogParentService,
  MultipleProjectsService,
  Resource,
  ResourceDialogsService,
  ResourceInputBridgeService,
  selectionCollectionProvider,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { Router } from '@angular/router';

const URL = '/root/resources';

@Component({
  selector: 'step-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('resourceList', STORE_ALL),
    ...selectionCollectionProvider<string, Resource>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => ResourcesListComponent),
    },
  ],
})
export class ResourcesListComponent implements DialogParentService {
  private _router = inject(Router);
  private _multipleProjectService = inject(MultipleProjectsService);
  private _resourceDialogs = inject(ResourceDialogsService);
  private _resourcesService = inject(AugmentedResourcesService);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  readonly dataSource = this._resourcesService.createDataSource();

  readonly returnParentUrl = URL;

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  dialogNotSuccessfullyClosed(): void {
    this._resourceInputBridgeService.deleteUploadedResource();
  }

  protected editResource(resource: Resource): void {
    const url = `${URL}/editor/${resource.id}`;

    if (this._multipleProjectService.isEntityBelongsToCurrentProject(resource)) {
      this._router.navigateByUrl(url);
      return;
    }

    this._multipleProjectService
      .confirmEntityEditInASeparateProject(resource, url, 'resource')
      .subscribe((continueEdit) => {
        if (continueEdit) {
          this._router.navigateByUrl(url);
        }
      });
  }

  protected createResource(): void {
    this._router.navigateByUrl(`${URL}/editor/new`);
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
