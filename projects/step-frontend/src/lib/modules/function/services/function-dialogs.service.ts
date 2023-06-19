import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  a1Promise2Observable,
  AJS_LOCATION,
  AJS_MODULE,
  AugmentedKeywordsService,
  DialogsService,
  EntityDialogsService,
  ExportDialogsService,
  Function as Keyword,
  FunctionLinkDialogService,
  ImportDialogsService,
  IsUsedByDialogService,
  UibModalHelperService,
} from '@exense/step-core';
import { ILocationService } from 'angular';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { FunctionConfigurationDialogComponent } from '../components/function-configuration-dialog/function-configuration-dialog.component';
import { FunctionConfigurationDialogData } from '../types/function-configuration-dialog-data.interface';
import { FunctionDialogsConfig } from '../types/function-dialogs-config.interface';
import { FunctionDialogsConfigFactoryService } from './function-dialogs-config-factory.service';

@Injectable({
  providedIn: 'root',
})
export class FunctionDialogsService implements FunctionLinkDialogService {
  private _functionApiService = inject(AugmentedKeywordsService);
  private _dialogs = inject(DialogsService);
  private _exportDialogs = inject(ExportDialogsService);
  private _importDialogs = inject(ImportDialogsService);
  private _httpClient = inject(HttpClient);
  private _uibModalHelper = inject(UibModalHelperService);
  private _isUsedByDialog = inject(IsUsedByDialogService);
  private _entityDialogs = inject(EntityDialogsService);
  private _location = inject<ILocationService>(AJS_LOCATION);
  private _functionDialogsConfigFactoryService = inject(FunctionDialogsConfigFactoryService);
  private _matDialog = inject(MatDialog);

  private defaultDialogConfig = this._functionDialogsConfigFactoryService.getDefaultConfig();

  openModal({
    keyword,
    dialogConfig,
  }: {
    keyword?: Keyword;
    dialogConfig?: FunctionDialogsConfig;
  }): Observable<Keyword | undefined> {
    const matDialogConfig: MatDialogConfig<FunctionConfigurationDialogData> = {
      data: {
        keyword,
        dialogConfig: dialogConfig ?? this.defaultDialogConfig,
      },
    };
    const dialogRef = this._matDialog.open(FunctionConfigurationDialogComponent, matDialogConfig);

    return dialogRef.afterClosed();
  }

  openAddFunctionModal(dialogConfig?: FunctionDialogsConfig): Observable<Keyword | undefined> {
    return this.openModal({
      dialogConfig,
    });
  }

  configureFunction(id: string, dialogConfig?: FunctionDialogsConfig): Observable<Keyword | undefined> {
    dialogConfig = dialogConfig ? dialogConfig : this.defaultDialogConfig;
    return this._httpClient.get<Keyword>(`rest/${dialogConfig.serviceRoot}/${id}`).pipe(
      switchMap((keyword) =>
        this.openModal({
          keyword,
          dialogConfig,
        })
      )
    );
  }

  openDeleteFunctionDialog(id: string, name: string): Observable<boolean> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Keyword "${name}"`)).pipe(
      map(() => true),
      catchError(() => of(false)),
      switchMap((isDeleteConfirmed) =>
        isDeleteConfirmed ? this._functionApiService.deleteFunction(id).pipe(map(() => true)) : of(false)
      )
    );
  }

  openLookUpFunctionDialog(id: string, name: string): void {
    this._isUsedByDialog.displayDialog(`Keyword "${name}" is used by`, 'KEYWORD_ID', id);
  }

  openExportFunctionDialog(id: string, name: string): Observable<boolean> {
    return this._exportDialogs.displayExportDialog('Keyword export', 'functions', `${name}.sta`, id);
  }

  openExportAllFunctionsDialog(): Observable<boolean> {
    return this._exportDialogs.displayExportDialog('Keyword export', 'functions', 'allKeywords.sta');
  }

  openImportFunctionDialog(): Observable<boolean | string[]> {
    return this._importDialogs.displayImportDialog('Keyword import', 'functions');
  }

  openFunctionEditor(id: string, dialogConfig?: FunctionDialogsConfig): Observable<boolean | undefined> {
    dialogConfig = dialogConfig ? dialogConfig : this.defaultDialogConfig;
    const httpOptions: Object = {
      headers: new HttpHeaders({
        Accept: 'text/html',
      }),
      responseType: 'text',
    };
    return this._httpClient.get<string>(`rest/${dialogConfig.serviceRoot}/${id}/editor`, httpOptions).pipe(
      map((path) => {
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

  selectFunction(): Observable<Keyword> {
    const selectedEntity$ = this._entityDialogs.selectEntityOfType('function', true);
    const function$ = selectedEntity$.pipe(
      map((result) => result.item),
      switchMap((id) => this._functionApiService.getFunctionById(id))
    );
    return function$;
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('FunctionDialogs', downgradeInjectable(FunctionDialogsService));
