import { Component, Inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  a1Promise2Observable,
  AJS_LOCATION,
  AJS_MODULE,
  DialogsService,
  TableRemoteDataSource,
  TableRestService,
} from '@exense/step-core';
import { HttpClient } from '@angular/common/http';
import { ExportDialogsService } from '../../../_common/services/export-dialogs.service';
import { ImportDialogsService } from '../../../_common/services/import-dialogs.service';
import { IsUsedByDialogsService } from '../../../_common/services/is-used-by-dialogs.service';
import { IsUsedByType } from '../../../_common/shared/is-used-by-type.enum';
import { catchError, map, noop, of, switchMap, tap } from 'rxjs';
import { ILocationService } from 'angular';

@Component({
  selector: 'step-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.scss'],
})
export class FunctionListComponent {
  readonly dataSource = new TableRemoteDataSource('plans', this._tableRest, {
    name: 'attributes.name',
    type: 'root._class',
    actions: '',
  });

  constructor(
    private _httpClient: HttpClient,
    private _tableRest: TableRestService,
    private _dialogs: DialogsService,
    private _exportDialogs: ExportDialogsService,
    private _importDialogs: ImportDialogsService,
    private _isUsedByDialogs: IsUsedByDialogsService,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  addFunction(): void {
    //this._planDialogs.createPlan().subscribe((_) => this.dataSource.reload());
  }

  addFunctionPackage(): void {
    //this._planDialogs.createPlan().subscribe((_) => this.dataSource.reload());
  }

  addKeywordPackage(): void {
    //this._planDialogs.createPlan().subscribe((_) => this.dataSource.reload());
  }

  editFunction(id: string): void {
    // openFunctionEditor()
    //this._location.path(`/root/plans/editor/${id}`);
  }

  executeKeyword(id: string): void {
    this._location.path(`/root/repository`).search({ repositoryId: 'local', planid: id });
  }

  duplicateFunction(id: string): void {
    this._httpClient
      .get<any>(`rest/plans/${id}/clone`)
      .pipe(
        map((clone) => {
          clone.attributes.name += '_Copy';
          return clone;
        }),
        switchMap((clone) => this._httpClient.post('rest/plans', clone))
      )
      .subscribe((_) => this.dataSource.reload());
  }

  deleteFunction(id: string, name: string): void {
    a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Plan "${name}"`))
      .pipe(
        map((_) => true),
        catchError((_) => of(false)),
        tap((isDeleteConfirmed) => console.log('IS DELETE CONFIRMED', isDeleteConfirmed)),
        switchMap((isDeleteConfirmed) =>
          isDeleteConfirmed ? this._httpClient.delete(`rest/plans/${id}`).pipe(map((_) => true)) : of(false)
        )
      )
      .subscribe((result) => {
        if (result) {
          this.dataSource.reload();
        }
      });
  }

  exportFunction(): void {}

  importFunctions(): void {
    this._importDialogs
      .displayImportDialog('Plans import', 'plans', true, false)
      .subscribe((_) => this.dataSource.reload());
  }

  exportFunctions(): void {
    this._exportDialogs
      .displayExportDialog('Plans export', 'plans', 'allPlans.sta', true, false)
      .subscribe((_) => this.dataSource.reload());
  }

  lookUp(id: string, name: string): void {
    this._isUsedByDialogs.displayDialog(`Keyword "${name}" is used by`, IsUsedByType.KEYWORD_ID, id).subscribe(noop);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepFunctionList', downgradeComponent({ component: FunctionListComponent }));
