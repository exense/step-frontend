import { Component, inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  Resource,
  AugmentedResourcesService,
  ResourceDialogsService,
  tablePersistenceConfigProvider,
  STORE_ALL,
} from '@exense/step-core';
import { DOCUMENT } from '@angular/common';

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
    this._resourceDialogs.editResource(resource).subscribe((_) => this.dataSource.reload());
  }

  createResource(): void {
    this._resourceDialogs.editResource().subscribe((_) => this.dataSource.reload());
  }

  deleteResource(id: string, label: string): void {
    this._resourceDialogs.deleteResource(id, label).subscribe((result: boolean) => {
      if (result) {
        this.dataSource.reload();
      }
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
