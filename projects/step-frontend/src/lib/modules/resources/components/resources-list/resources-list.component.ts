import { Component, inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AugmentedResourcesService,
  Resource,
  ResourceDialogsService,
  STORE_ALL,
  StepDataSource,
  tablePersistenceConfigProvider,
} from '@exense/step-core';

const updateDataSource = (dataSource: StepDataSource<Resource>) => {
  return (mutatedResource?: Resource | boolean): void => {
    if (!mutatedResource) {
      return;
    }

    dataSource.reload();
  };
};

@Component({
  selector: 'step-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss'],
  providers: [tablePersistenceConfigProvider('resourceList', STORE_ALL)],
})
export class ResourcesListComponent {
  private _resourceDialogs = inject(ResourceDialogsService);
  private _resourcesService = inject(AugmentedResourcesService);

  readonly dataSource = this._resourcesService.createDataSource();

  protected editResource(resource: Resource): void {
    this._resourceDialogs.editResource(resource).subscribe(updateDataSource(this.dataSource));
  }

  protected createResource(): void {
    this._resourceDialogs.editResource().subscribe(updateDataSource(this.dataSource));
  }

  protected deleteResource(id: string, label: string): void {
    this._resourceDialogs.deleteResource(id, label).subscribe(updateDataSource(this.dataSource));
  }

  protected downloadResource(id: string): void {
    this._resourceDialogs.downloadResource(id);
  }

  protected searchResource(resource: Resource): void {
    this._resourceDialogs.searchResource(resource);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepResourcesList', downgradeComponent({ component: ResourcesListComponent }));
