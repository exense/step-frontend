import { Component, Inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  a1Promise2Observable,
  AJS_FUNCTION_TYPE_REGISTRY,
  AJS_LOCATION,
  AJS_MODULE,
  AJS_ROOT_SCOPE,
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
import { ILocationService, IRootScopeService } from 'angular';
import { FunctionDialogsService } from '../../servies/function-dialogs.service';
import { FunctionPackageDialogsService } from '../../servies/function-package-dialogs.service';

@Component({
  selector: 'step-function-list',
  templateUrl: './function-list.component.html',
  styleUrls: ['./function-list.component.scss'],
})
export class FunctionListComponent {
  readonly dataSource = new TableRemoteDataSource('functions', this._tableRest, {
    name: 'attributes.name',
    type: 'type',
    package: 'customFields.functionPackageId',
    actions: '',
  });

  constructor(
    private _httpClient: HttpClient,
    private _tableRest: TableRestService,
    private _dialogs: DialogsService,
    private _functionDialogs: FunctionDialogsService,
    private _functionPackageDialogs: FunctionPackageDialogsService,
    private _exportDialogs: ExportDialogsService,
    private _importDialogs: ImportDialogsService,
    private _isUsedByDialogs: IsUsedByDialogsService,
    @Inject(AJS_ROOT_SCOPE) private _$rootScope: IRootScopeService,
    @Inject(AJS_LOCATION) private _location: ILocationService,
    @Inject(AJS_FUNCTION_TYPE_REGISTRY) private _functionTypeRegistry: any
  ) {}

  addFunction(): void {
    this._functionDialogs.addFunction().subscribe((_) => this.dataSource.reload());
  }

  addFunctionPackage(): void {
    this._functionPackageDialogs.addFunctionPackage().subscribe((_) => this.dataSource.reload());
  }

  editFunction(id: string): void {
    this._functionDialogs.openFunctionEditor(id);
  }

  executeFunction(id: string): void {
    this._httpClient.post<any>(`rest/interactive/functiontest/${id}/start`, {}).subscribe((result: any) => {
      (this._$rootScope as any).planEditorInitialState = {
        interactive: true,
        selectedNode: result.callFunctionId,
      };
      this._location.path('/root/plans/editor/' + result.planId);
    });
  }

  duplicateFunction(id: string): void {
    this._httpClient.post<any>(`rest/functions/${id}/copy`, {}).subscribe((_) => this.dataSource.reload());
  }

  deleteFunction(id: string, name: string): void {
    a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Keyword "${name}"`))
      .pipe(
        map((_) => true),
        catchError((_) => of(false)),
        tap((isDeleteConfirmed) => console.log('IS DELETE CONFIRMED', isDeleteConfirmed)),
        switchMap((isDeleteConfirmed) =>
          isDeleteConfirmed ? this._httpClient.delete(`rest/functions/${id}`).pipe(map((_) => true)) : of(false)
        )
      )
      .subscribe((result) => {
        if (result) {
          this.dataSource.reload();
        }
      });
  }

  exportFunction(id: string, name: string): void {
    this._exportDialogs
      .displayExportDialog('Keyword export', 'functions/' + id, name + '.sta')
      .subscribe((_) => this.dataSource.reload());
  }

  importFunctions(): void {
    this._importDialogs.displayImportDialog('Keyword import', 'functions').subscribe((_) => this.dataSource.reload());
  }

  exportFunctions(): void {
    this._exportDialogs
      .displayExportDialog('Keyword export', 'functions', 'allKeywords.sta')
      .subscribe((_) => this.dataSource.reload());
  }

  lookUp(id: string, name: string): void {
    this._isUsedByDialogs.displayDialog(`Keyword "${name}" is used by`, IsUsedByType.KEYWORD_ID, id).subscribe(noop);
  }

  configureFunction(id: string) {
    this._functionDialogs.configureFunction(id).subscribe((_) => this.dataSource.reload());
  }

  functionTypeLabel(type: string) {
    return this._functionTypeRegistry.getLabel(type);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepFunctionList', downgradeComponent({ component: FunctionListComponent }));
