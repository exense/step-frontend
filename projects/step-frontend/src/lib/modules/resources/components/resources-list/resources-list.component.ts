import { AfterViewInit, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  AugmentedResourcesService,
  AutoDeselectStrategy,
  EditorResolverService,
  MultipleProjectsService,
  Resource,
  ResourceDialogsService,
  ResourceInputBridgeService,
  selectionCollectionProvider,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { Observable, of, pipe, switchMap, take, tap } from 'rxjs';
import { ResourceConfigurationDialogData } from '../resource-configuration-dialog/resource-configuration-dialog-data.interface';
import { ResourceConfigurationDialogComponent } from '../resource-configuration-dialog/resource-configuration-dialog.component';

const RESOURCE_ID = 'resourceId';

@Component({
  selector: 'step-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('resourceList', STORE_ALL),
    ...selectionCollectionProvider<string, Resource>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
})
export class ResourcesListComponent implements AfterViewInit {
  private _matDialog = inject(MatDialog);
  private _multipleProjectService = inject(MultipleProjectsService);
  private _editorResolver = inject(EditorResolverService);
  private _resourceDialogs = inject(ResourceDialogsService);
  private _resourcesService = inject(AugmentedResourcesService);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  private updateDataSourceAfterChange = pipe(
    tap((mutatedResource?: Resource | boolean) => {
      if (mutatedResource) {
        this.dataSource.reload();
      }
    })
  );

  readonly dataSource = this._resourcesService.createDataSource();

  ngAfterViewInit(): void {
    this._editorResolver
      .onEditEntity(RESOURCE_ID)
      .pipe(take(1))
      .subscribe((resourceId) => this.editResourceInternal(resourceId));
  }

  protected editResource(resource: Resource): void {
    if (this._multipleProjectService.isEntityBelongsToCurrentProject(resource)) {
      this.openEditResourceDialog(resource).pipe(this.updateDataSourceAfterChange).subscribe();
      return;
    }

    const url = '/root/resources';
    const editParams = { [RESOURCE_ID]: resource.id };

    this._multipleProjectService
      .confirmEntityEditInASeparateProject(resource, { url, search: editParams }, 'resource')
      .pipe(
        switchMap((continueEdit) => {
          if (continueEdit) {
            // continue edit without project switch
            return this.openEditResourceDialog(resource, true);
          }
          return of(false);
        }),
        this.updateDataSourceAfterChange
      )
      .subscribe();
  }

  protected createResource(): void {
    this.openEditResourceDialog().pipe(this.updateDataSourceAfterChange).subscribe();
  }

  protected deleteResource(id: string, label: string): void {
    this._resourceDialogs.deleteResource(id, label).pipe(this.updateDataSourceAfterChange).subscribe();
  }

  protected downloadResource(id: string): void {
    this._resourceDialogs.downloadResource(id);
  }

  protected searchResource(resource: Resource): void {
    this._resourceDialogs.searchResource(resource);
  }

  private openEditResourceDialog(resource?: Resource, isReadonly?: boolean): Observable<Resource | undefined> {
    const matDialogRef = this._matDialog.open<
      ResourceConfigurationDialogComponent,
      ResourceConfigurationDialogData,
      Resource | undefined
    >(ResourceConfigurationDialogComponent, {
      data: {
        resource,
        isReadonly,
      },
    });

    return matDialogRef.beforeClosed().pipe(
      tap((updatedResource) => {
        if (updatedResource) {
          return;
        }

        this._resourceInputBridgeService.deleteUploadedResource();
      }),
      switchMap(() => matDialogRef.afterClosed())
    );
  }

  private editResourceInternal(resourceId: string): void {
    this._resourcesService
      .getResource(resourceId)
      .pipe(
        switchMap((resource) => this.openEditResourceDialog(resource)),
        this.updateDataSourceAfterChange
      )
      .subscribe();
  }
}
