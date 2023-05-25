import { DOCUMENT } from '@angular/common';
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
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { Observable, switchMap, tap } from 'rxjs';
import { ResourceConfigurationDialogData } from '../resource-configuration-dialog/resource-configuration-dialog-data.interface';
import { ResourceConfigurationDialogComponent } from '../resource-configuration-dialog/resource-configuration-dialog.component';

@Component({
  selector: 'step-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss'],
  providers: [tablePersistenceConfigProvider('resourceList', STORE_ALL)],
})
export class ResourcesListComponent {
  private _resourceDialogs = inject(ResourceDialogsService);
  private _resourcesService = inject(AugmentedResourcesService);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);
  private _document = inject(DOCUMENT);
  private _matDialog = inject(MatDialog);

  readonly dataSource = this._resourcesService.createDatasource();

  private openResourceConfigurationDialog(resource?: Resource): Observable<Resource | undefined> {
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

  protected editResource(resource: Resource): void {
    this.openResourceConfigurationDialog(resource).subscribe((updatedResource) => {
      if (!updatedResource) {
        return;
      }

      this.dataSource.reload();
    });
  }

  protected createResource(): void {
    this.openResourceConfigurationDialog().subscribe((updatedResource) => {
      if (!updatedResource) {
        return;
      }

      this.dataSource.reload();
    });
  }

  protected deleteResource(id: string, label: string): void {
    this._resourceDialogs.deleteResource(id, label).subscribe((deletedResource: boolean) => {
      if (!deletedResource) {
        return;
      }

      this.dataSource.reload();
    });
  }

  protected downloadResource(id: string): void {
    const url = `rest/resources/${id}/content`;
    this._document.defaultView!.open(url, '_blank');
  }

  protected searchResource(resource: Resource): void {
    this._resourceDialogs.searchResource(resource);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepResourcesList', downgradeComponent({ component: ResourcesListComponent }));
