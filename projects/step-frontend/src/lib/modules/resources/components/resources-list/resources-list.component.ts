import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AugmentedResourcesService,
  Resource,
  ResourceDialogsService,
  ResourceInputBridgeService,
  STORE_ALL,
  StepDataSource,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { Observable, switchMap, tap } from 'rxjs';
import { ResourceConfigurationDialogData } from '../resource-configuration-dialog/resource-configuration-dialog-data.interface';
import { ResourceConfigurationDialogComponent } from '../resource-configuration-dialog/resource-configuration-dialog.component';

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
  private _matDialog = inject(MatDialog);
  private _resourceDialogs = inject(ResourceDialogsService);
  private _resourcesService = inject(AugmentedResourcesService);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  readonly dataSource = this._resourcesService.createDataSource();

  protected editResource(resource: Resource): void {
    this.openEditResourceDialog(resource).subscribe(updateDataSource(this.dataSource));
  }

  protected createResource(): void {
    this.openEditResourceDialog().subscribe(updateDataSource(this.dataSource));
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

  private openEditResourceDialog(resource?: Resource): Observable<Resource | undefined> {
    const matDialogRef = this._matDialog.open<
      ResourceConfigurationDialogComponent,
      ResourceConfigurationDialogData,
      Resource | undefined
    >(ResourceConfigurationDialogComponent, {
      data: {
        resource,
      },
    });

    return matDialogRef.beforeClosed().pipe(
      tap((updatedResource) => {
        if (updatedResource) {
          return;
        }

        this._resourceInputBridgeService.deleteLastUploadedResource();
      }),
      switchMap(() => matDialogRef.afterClosed())
    );
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepResourcesList', downgradeComponent({ component: ResourcesListComponent }));
