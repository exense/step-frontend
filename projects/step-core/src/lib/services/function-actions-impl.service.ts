import { EnvironmentInjector, Injectable, Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, take, tap } from 'rxjs';
import { AugmentedKeywordsService, Keyword } from '../client/step-client-module';
import { EditorResolverService, MultipleProjectsService } from '../modules/basics/step-basics.module';
import { EntityDialogsService } from '../modules/entity/entity.module';
import {
  FunctionActionsService,
  FunctionConfigurationApiService,
  FunctionConfigurationService,
  FunctionDialogsConfig,
  FunctionDialogsConfigFactoryService,
} from '../modules/keywords-common/keywords-common.module';
import { DialogsService } from '../shared';
import { ExportDialogsService } from './export-dialogs.service';
import { ImportDialogsService } from './import-dialogs.service';
import { IsUsedByDialogService } from './is-used-by-dialog.service';

const CONFIGURER_KEYWORD_ID = 'configurerKeywordId';
const ENTITY_TYPE = 'keyword';
const EDITOR_URL = '/root/functions';

@Injectable({
  providedIn: 'root',
})
export class FunctionActionsImplService implements FunctionActionsService {
  private _editorResolver = inject(EditorResolverService);
  private _multipleProjectService = inject(MultipleProjectsService);
  private _functionApiService = inject(AugmentedKeywordsService);
  private _dialogs = inject(DialogsService);
  private _exportDialogs = inject(ExportDialogsService);
  private _importDialogs = inject(ImportDialogsService);
  protected _isUsedByDialog = inject(IsUsedByDialogService);
  private _router = inject(Router);
  private _functionDialogsConfigFactoryService = inject(FunctionDialogsConfigFactoryService);
  private _functionConfigurationService = inject(FunctionConfigurationService);

  private defaultDialogConfig = this._functionDialogsConfigFactoryService.getDefaultConfig();

  openAddFunctionModal(
    parentInjector: Injector,
    dialogConfig?: FunctionDialogsConfig
  ): Observable<Keyword | undefined> {
    return this.openModal(parentInjector, {
      dialogConfig,
    });
  }

  configureFunction(
    parentInjector: Injector,
    id: string,
    dialogConfig?: FunctionDialogsConfig
  ): Observable<Keyword | undefined> {
    return this.getFunctionById(id).pipe(
      switchMap((keyword) => {
        if (!keyword) {
          return of({ keyword, continueEdit: false });
        }

        if (this._multipleProjectService.isEntityBelongsToCurrentProject(keyword)) {
          return of({ keyword, continueEdit: true });
        }

        const url = EDITOR_URL;
        const editParam = { [CONFIGURER_KEYWORD_ID]: id };

        return this._multipleProjectService
          .confirmEntityEditInASeparateProject(keyword, { url, search: editParam }, ENTITY_TYPE)
          .pipe(map((continueEdit) => ({ keyword, continueEdit })));
      }),
      switchMap(({ continueEdit, keyword }) => {
        if (continueEdit) {
          return this.openModal(parentInjector, { keyword, dialogConfig });
        }
        return of(undefined);
      })
    );
  }

  openDeleteFunctionDialog(id: string, name: string): Observable<boolean> {
    return this._dialogs
      .showDeleteWarning(1, `Keyword "${name}"`)
      .pipe(
        switchMap((isDeleteConfirmed) =>
          isDeleteConfirmed ? this._functionApiService.deleteFunction(id).pipe(map(() => true)) : of(false)
        )
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
      })
    );
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
      })
    );
  }

  resolveConfigureLinkIfExits(parentInjector: Injector, dialogConfig?: FunctionDialogsConfig): void {
    this._editorResolver
      .onEditEntity(CONFIGURER_KEYWORD_ID)
      .pipe(
        take(1),
        switchMap((keywordId) => (keywordId ? this.getFunctionById(keywordId) : of(undefined))),
        switchMap((keyword) => (keyword ? this.openModal(parentInjector, { keyword, dialogConfig }) : of(undefined)))
      )
      .subscribe();
  }

  protected newFunctionTypeConf(type: string): Observable<Keyword> {
    return this._functionApiService.newFunctionTypeConf(type);
  }

  protected saveFunction(keyword?: Keyword): Observable<Keyword> {
    return this._functionApiService.saveFunction(keyword);
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

  private configureFunctionInternal(
    parentInjector: Injector,
    id: string,
    dialogConfig?: FunctionDialogsConfig
  ): Observable<Keyword | undefined> {
    return this.getFunctionById(id).pipe(
      switchMap((keyword) =>
        this.openModal(parentInjector, {
          keyword,
          dialogConfig,
        })
      )
    );
  }

  private openModal(
    parentInjector: Injector,
    params: {
      keyword?: Keyword;
      dialogConfig?: FunctionDialogsConfig;
    }
  ): Observable<Keyword | undefined> {
    const modalInjector = Injector.create({
      providers: [
        {
          provide: FunctionConfigurationApiService,
          useValue: {
            newFunctionTypeConf: (type: string) => this.newFunctionTypeConf(type),
            saveFunction: (keyword?: Keyword) => this.saveFunction(keyword),
            getFunctionEditor: (id: string) => this.getFunctionEditor(id),
          } as FunctionConfigurationApiService,
        },
      ],
      parent: parentInjector,
    }) as EnvironmentInjector;

    return this._functionConfigurationService
      .configure(modalInjector, params.keyword, params.dialogConfig ?? this.defaultDialogConfig)
      .pipe(tap(() => modalInjector.destroy()));
  }
}
