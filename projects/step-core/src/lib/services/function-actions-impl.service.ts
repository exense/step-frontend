import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { AugmentedKeywordsService, Keyword } from '../client/step-client-module';
import { MultipleProjectsService } from '../modules/basics/step-basics.module';
import { FunctionActionsService } from '../modules/keywords-common/keywords-common.module';
import { DialogsService } from '../shared';
import { IsUsedByDialogService } from './is-used-by-dialog.service';

const ENTITY_TYPE = 'keyword';
const EDITOR_URL = '/root/functions';

@Injectable({
  providedIn: 'root',
})
export class FunctionActionsImplService implements FunctionActionsService {
  private _multipleProjectService = inject(MultipleProjectsService);
  private _functionApiService = inject(AugmentedKeywordsService);
  private _dialogs = inject(DialogsService);
  protected _isUsedByDialog = inject(IsUsedByDialogService);
  private _router = inject(Router);

  get baseUrl(): string {
    return EDITOR_URL;
  }

  addFunction(): void {
    this._router.navigateByUrl(`${this.baseUrl}/configure/new`);
  }

  configureFunction(id: string): void {
    const url = `${this.baseUrl}/configure/${id}`;
    this.getFunctionById(id)
      .pipe(
        switchMap((keyword) => {
          if (!keyword) {
            return of(false);
          }
          if (this._multipleProjectService.isEntityBelongsToCurrentProject(keyword)) {
            return of(true);
          }

          return this._multipleProjectService.confirmEntityEditInASeparateProject(keyword, url, ENTITY_TYPE);
        }),
      )
      .subscribe((continueEdit) => {
        if (!continueEdit) {
          return;
        }
        this._router.navigateByUrl(url);
      });
  }

  openDeleteFunctionDialog(id: string, name: string): Observable<boolean> {
    return this._dialogs
      .showDeleteWarning(1, `Keyword "${name}"`)
      .pipe(
        switchMap((isDeleteConfirmed) =>
          isDeleteConfirmed ? this._functionApiService.deleteFunction(id).pipe(map(() => true)) : of(false),
        ),
      );
  }

  openLookUpFunctionDialog(id: string, name: string): void {
    this._isUsedByDialog.displayDialog(`Keyword "${name}" is used by`, 'KEYWORD_ID', id);
  }

  duplicateFunction(keyword: Keyword): Observable<boolean> {
    return this.duplicateFunctionById(keyword.id!).pipe(
      map((result) => !!result),
      catchError((err) => {
        console.error(err);
        return of(false);
      }),
    );
  }

  openExportFunctionDialog(id: string): void {
    this._router.navigateByUrl(`${this.baseUrl}/export/${id}`);
  }

  openExportAllFunctionsDialog(): void {
    this._router.navigateByUrl(`${this.baseUrl}/export/all`);
  }

  openImportFunctionDialog(): void {
    this._router.navigateByUrl(`${this.baseUrl}/import`);
  }

  openFunctionEditor(keyword: Keyword): Observable<boolean | undefined> {
    return this.getFunctionEditor(keyword.id!).pipe(
      tap((path) => {
        if (!path) {
          this._dialogs.showErrorMsg('No editor configured for this function type').subscribe();
          throw new Error('No path');
        }
      }),
      switchMap((editorPath) => {
        if (this._multipleProjectService.isEntityBelongsToCurrentProject(keyword)) {
          const continueEdit = true;
          return of({ continueEdit, editorPath });
        }

        return this._multipleProjectService
          .confirmEntityEditInASeparateProject(keyword, editorPath, ENTITY_TYPE)
          .pipe(map((continueEdit) => ({ continueEdit, editorPath })));
      }),
      map((result) => {
        if (result.continueEdit) {
          this._router.navigateByUrl(result.editorPath);
        }
        return result.continueEdit;
      }),
      catchError((error) => {
        console.error(error);
        return of(undefined);
      }),
    );
  }

  protected getFunctionEditor(id: string): Observable<string> {
    return this._functionApiService.getFunctionEditor(id);
  }

  protected getFunctionById(id: string): Observable<Keyword> {
    return this._functionApiService.getFunctionById(id);
  }

  protected duplicateFunctionById(id: string): Observable<Keyword> {
    return this._functionApiService.cloneFunction(id);
  }
}
