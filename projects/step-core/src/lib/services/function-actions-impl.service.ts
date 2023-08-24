import { Injectable, inject, Injector, EnvironmentInjector } from '@angular/core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { ILocationService } from 'angular';
import { Observable, catchError, map, of, switchMap, tap, take } from 'rxjs';
import { AugmentedKeywordsService, Function as Keyword } from '../client/step-client-module';
import { EditorResolverService, MultipleProjectsService } from '../modules/basics/step-basics.module';
import { EntityDialogsService } from '../modules/entity/entity.module';
import {
  FunctionActionsService,
  FunctionConfigurationApiService,
  FunctionConfigurationService,
  FunctionDialogsConfig,
  FunctionDialogsConfigFactoryService,
} from '../modules/keywords-common/keywords-common.module';
import { a1Promise2Observable, AJS_LOCATION, AJS_MODULE, DialogsService } from '../shared';
import { ExportDialogsService } from './export-dialogs.service';
import { ImportDialogsService } from './import-dialogs.service';
import { IsUsedByDialogService } from './is-used-by-dialog.service';

const CONFIGURER_KEYWORD_ID = 'configurerKeywordId';
const ENTITY_TYPE = 'keyword';

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
  private _isUsedByDialog = inject(IsUsedByDialogService);
  private _entityDialogs = inject(EntityDialogsService);
  private _$location = inject<ILocationService>(AJS_LOCATION);
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

        const url = this._$location.path();
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

  openFunctionEditor(keyword: Keyword): Observable<boolean | undefined> {
    return this.getFunctionEditor(keyword.id!).pipe(
      tap((path) => {
        if (!path) {
          this._dialogs.showErrorMsg('No editor configured for this function type');
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
          this._$location.path(result.editorPath);
        }
        return result.continueEdit;
      }),
      catchError((error) => {
        console.error(error);
        return of(undefined);
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

getAngularJSGlobal().module(AJS_MODULE).service('FunctionDialogs', downgradeInjectable(FunctionActionsImplService));