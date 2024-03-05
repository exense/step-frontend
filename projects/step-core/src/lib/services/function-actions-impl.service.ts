import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { AugmentedKeywordsService, Keyword } from '../client/step-client-module';
import { CommonEditorUrlsService, MultipleProjectsService } from '../modules/basics/step-basics.module';
import { FunctionActionsService } from '../modules/keywords-common/keywords-common.module';
import { DialogsService } from '../shared';

@Injectable({
  providedIn: 'root',
})
export class FunctionActionsImplService implements FunctionActionsService {
  private _multipleProjectService = inject(MultipleProjectsService);
  private _functionApiService = inject(AugmentedKeywordsService);
  private _dialogs = inject(DialogsService);
  private _router = inject(Router);
  private _commonEditorUrls = inject(CommonEditorUrlsService);

  resolveConfigurerUrl(idOrKeyword: string | Keyword): string {
    return this._commonEditorUrls.keywordConfigurerUrl(idOrKeyword);
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
          .confirmEntityEditInASeparateProject(keyword, editorPath, 'keyword')
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
}
