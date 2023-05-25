import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AugmentedResourcesService,
  Resource,
  ResourceDialogsService,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';

@Component({
  selector: 'step-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss'],
  providers: [tablePersistenceConfigProvider('resourceList', STORE_ALL)],
})
export class ResourcesListComponent {
  private _resourceDialogs = inject(ResourceDialogsService);
  private _resourcesService = inject(AugmentedResourcesService);
  private _document = inject(DOCUMENT);

  readonly dataSource = this._resourcesService.createDatasource();

  editResource(resource: Resource): void {
    this._resourceDialogs.editResource(resource).subscribe((updatedResource) => {
      if (!updatedResource) {
        return;
      }

      this.dataSource.reload();
    });
  }

  createResource(): void {
    this._resourceDialogs.editResource().subscribe((updatedResource) => {
      if (!updatedResource) {
        return;
      }

      this.dataSource.reload();
    });
  }

  deleteResource(id: string, label: string): void {
    this._resourceDialogs.deleteResource(id, label).subscribe((deletedResource: boolean) => {
      if (!deletedResource) {
        return;
      }

      this.dataSource.reload();
    });
  }

  downloadResource(id: string): void {
    const url = `rest/resources/${id}/content`;
    this._document.defaultView!.open(url, '_blank');
  }

  searchResource(resource: Resource): void {
    this._resourceDialogs.searchResource(resource);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepResourcesList', downgradeComponent({ component: ResourcesListComponent }));
