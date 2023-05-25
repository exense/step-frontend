import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { Resource, ResourcesService } from '../client/generated';
import { ResourceConfigurationDialogData } from '../components/resource-configuration-dialog/resource-configuration-dialog-data.interface';
import { SearchResourceDialogComponent } from '../components/search-resource-dialog/search-resource-dialog.component';
import { a1Promise2Observable, DialogsService } from '../shared';
import { ResourceConfigurationDialogComponent } from '../step-core.module';
import { IsUsedByDialogService } from './is-used-by-dialog.service';
import { ResourceInputBridgeService } from './resource-input-bridge.service';
import { UibModalHelperService } from './uib-modal-helper.service';

@Injectable({
  providedIn: 'root',
})
export class ResourceDialogsService {
  private _uibModalHelper = inject(UibModalHelperService);
  private _dialogs = inject(DialogsService);
  private _resourcesService = inject(ResourcesService);
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _matDialog = inject(MatDialog);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  readonly RESOURCE_SEARCH_TYPE = 'RESOURCE_ID';

  editResource(resource?: Resource): Observable<Resource | undefined> {
    const matDialogRef = this._matDialog.open<
      ResourceConfigurationDialogComponent,
      ResourceConfigurationDialogData,
      Resource | undefined
    >(ResourceConfigurationDialogComponent, {
      data: {
        resource,
      },
    });

    return matDialogRef.afterClosed().pipe(
      tap((updatedResource) => {
        if (updatedResource) {
          return;
        }

        this._resourceInputBridgeService.deleteLastUploadedResource();
      })
    );
  }

  deleteResource(id: string, label: string): Observable<boolean> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Resource "${label}"`)).pipe(
      switchMap(() => this._resourcesService.deleteResource(id)),
      map(() => true),
      catchError(() => of(false))
    );
  }

  searchResource(resource: Resource): void {
    this._isUsedByDialogs.displayDialog(resource.resourceName || '', this.RESOURCE_SEARCH_TYPE, resource.id!);
  }

  showSearchResourceDialog(type: string): Observable<string> {
    const dialogRef = this._matDialog.open(SearchResourceDialogComponent, { data: type });
    return dialogRef.afterClosed() as Observable<string>;
  }

  showFileAlreadyExistsWarning(similarResources: Resource[]): Observable<string> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/resources/fileAlreadyExistsWarning.html',
      controller: 'fileAlreadyExistsWarningCtrl',
      resolve: {
        similarResources: () => {
          return similarResources;
        },
      },
    });

    return a1Promise2Observable(modalInstance.result) as Observable<string>;
  }

  showUpdateResourceWarning(resource?: Resource): Observable<boolean> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/resources/updateResourceWarning.html',
      controller: 'updateResourceWarningCtrl',
      resolve: {
        resource: () => {
          return resource;
        },
      },
    });

    return a1Promise2Observable(modalInstance.result) as Observable<boolean>;
  }
}
