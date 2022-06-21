import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  DialogsService,
  IsUsedByDialogsService,
  AuthService,
  a1Promise2Observable,
  ContextService,
  Mutable,
  ResourcesService,
  TableRestService,
  TableRemoteDataSource,
  Resource,
} from '@exense/step-core';
import { BehaviorSubject, switchMap, of, catchError, noop, shareReplay, tap, map, Observable } from 'rxjs';
import { ResourceDialogsService } from '../services/resource-dialogs.service';

type InProgress = Mutable<Pick<ResourcesListComponent, 'inProgress'>>;

@Component({
  selector: 'step-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss'],
})
export class ResourcesListComponent {
  readonly RESOURCE_TABLE_ID = 'resources';
  readonly RESOURCE_SEARCH_TYPE = 'RESOURCE_ID';

  readonly dataSource = new TableRemoteDataSource(
    this.RESOURCE_TABLE_ID,
    this._tableRest,
    {
      name: 'attributes.name',
      resourceType: 'resourceType',
      id: 'id',
    },
    'not(resourceType=attachment)'
  );

  readonly currentUserName: string;
  readonly inProgress: boolean = false;

  constructor(
    private _resourcesService: ResourcesService,
    private _dialogs: DialogsService,
    private _resourceDialogs: ResourceDialogsService,
    private _isUsedByDialogs: IsUsedByDialogsService,
    private _auth: AuthService,
    private _tableRest: TableRestService,
    context: ContextService
  ) {
    this.currentUserName = context.userName;
  }

  editResource(resource: Resource): void {
    this._resourceDialogs.editResource(resource).subscribe((_) => this.dataSource.reload());
  }

  createResource(): void {
    this._resourceDialogs.editResource().subscribe((_) => this.dataSource.reload());
  }

  deleteResource(id: string, label: string): void {
    a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Resource "${label}"`))
      .pipe(
        switchMap((_) => this._resourcesService.deleteResource(id)),
        map((_) => true),
        catchError((_) => of(false))
      )
      .subscribe((result: boolean) => {
        if (result) {
          this.dataSource.reload();
        }
      });
  }

  searchResource(resource: Resource): void {
    a1Promise2Observable(
      this._isUsedByDialogs.displayDialog(resource.resourceName, this.RESOURCE_SEARCH_TYPE, resource.id)
    ).subscribe();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepResourcesList', downgradeComponent({ component: ResourcesListComponent }));
