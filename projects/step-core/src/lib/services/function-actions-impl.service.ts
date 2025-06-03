import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { AugmentedKeywordsService, Keyword } from '../client/step-client-module';
import {
  CommonEntitiesUrlsService,
  MultipleProjectsService,
  DialogsService,
} from '../modules/basics/step-basics.module';
import { FunctionActionsService } from '../modules/keywords-common';

@Injectable({
  providedIn: 'root',
})
export class FunctionActionsImplService implements FunctionActionsService {
  private _multipleProjectService = inject(MultipleProjectsService);
  private _functionApiService = inject(AugmentedKeywordsService);
  private _dialogs = inject(DialogsService);
  private _router = inject(Router);
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  resolveConfigurerUrl(idOrKeyword: string | Keyword): string {
    return this._commonEntitiesUrls.keywordConfigurerUrl(idOrKeyword);
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
      map((path) => {
        if (path) {
          this._router.navigateByUrl(path);
          return true;
        }
        return false;
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
