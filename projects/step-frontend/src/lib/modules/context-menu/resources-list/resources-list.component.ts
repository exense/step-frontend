import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Resource, AugmentedResourcesService } from '@exense/step-core';
import { ResourceDialogsService } from '../services/resource-dialogs.service';

@Component({
  selector: 'step-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss'],
})
export class ResourcesListComponent {
  readonly dataSource = this._augmentedResourcesService.dataSource;

  constructor(
    private _resourceDialogs: ResourceDialogsService,
    private _augmentedResourcesService: AugmentedResourcesService
  ) {}

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

  searchResource(resource: Resource): void {
    this._resourceDialogs.searchResource(resource).subscribe();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepResourcesList', downgradeComponent({ component: ResourcesListComponent }));
