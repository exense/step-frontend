import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  a1Promise2Observable,
  AJS_FUNCTION_DIALOGS_CONFIG,
  AJS_LOCATION,
  AugmentedKeywordsService,
  DialogsService,
  ExportDialogsService,
  ImportDialogsService,
  IsUsedByDialogService,
  UibModalHelperService,
} from '@exense/step-core';
import { ILocationService } from 'angular';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FunctionDialogsService {
  readonly defaultDialogConfig = this._functionDialogsConfig.getDefaultConfig();

  constructor(
    private _functionApiService: AugmentedKeywordsService,
    private _dialogs: DialogsService,
    private _exportDialogs: ExportDialogsService,
    private _importDialogs: ImportDialogsService,
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _isUsedByDialog: IsUsedByDialogService,
    @Inject(AJS_FUNCTION_DIALOGS_CONFIG) public _functionDialogsConfig: any,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  openModal(function_: any, dialogConfig?: any): Observable<any> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/functions/functionConfigurationDialog.html',
      controller: 'newFunctionModalCtrl',
      resolve: {
        function_: () => function_,
        dialogConfig: () => (dialogConfig ? dialogConfig : this.defaultDialogConfig),
      },
    });
    return a1Promise2Observable(modalInstance.result);
  }

  openAddFunctionModal(dialogConfig?: any): Observable<any> {
    return this.openModal(null, dialogConfig);
  }

  configureFunction(id: string, dialogConfig?: any): Observable<any> {
    dialogConfig = dialogConfig ? dialogConfig : this.defaultDialogConfig;
    return this._httpClient
      .get<any>(`rest/${dialogConfig.serviceRoot}/${id}`)
      .pipe(switchMap((response) => this.openModal(response, dialogConfig)));
  }

  openDeleteFunctionDialog(id: string, name: string): Observable<any> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Keyword "${name}"`)).pipe(
      map((_) => true),
      catchError((_) => of(false)),
      tap((isDeleteConfirmed) => console.log('IS DELETE CONFIRMED', isDeleteConfirmed)),
      switchMap((isDeleteConfirmed) =>
        isDeleteConfirmed ? this._functionApiService.deleteFunction(id).pipe(map((_) => true)) : of(false)
      )
    );
  }

  openLookUpFunctionDialog(id: string, name: string): void {
    this._isUsedByDialog.displayDialog(`Keyword "${name}" is used by`, 'KEYWORD_ID', id);
  }

  openExportFunctionDialog(id: string, name: string): Observable<any> {
    return this._exportDialogs.displayExportDialog('Keyword export', 'functions/' + id, name + '.sta');
  }

  openExportAllFunctionsDialog(): Observable<any> {
    return this._exportDialogs.displayExportDialog('Keyword export', 'functions', 'allKeywords.sta');
  }

  openImportFunctionDialog(): Observable<any> {
    return this._importDialogs.displayImportDialog('Keyword import', 'functions');
  }

  openFunctionEditor(id: string, dialogConfig?: any): Observable<any> {
    dialogConfig = dialogConfig ? dialogConfig : this.defaultDialogConfig;
    const httpOptions: Object = {
      headers: new HttpHeaders({
        Accept: 'text/html',
      }),
      responseType: 'text',
    };
    return this._httpClient.get<string>(`rest/${dialogConfig.serviceRoot}/${id}/editor`, httpOptions).pipe(
      map((path) => {
        console.log('path', path);
        if (path) {
          this._location.path(path);
          return true;
        } else {
          this._dialogs.showErrorMsg('No editor configured for this function type');
          return undefined;
        }
      })
    );
  }

  selectFunction(): Observable<any> {
    const selectedEntity$ = a1Promise2Observable<any>(this._dialogs.selectEntityOfType('function', true));
    const function$ = selectedEntity$.pipe(
      map((result) => result.item),
      switchMap((id) => this._functionApiService.getFunctionById(id))
    );
    return function$;
  }
}
