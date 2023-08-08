import { inject, Injectable } from '@angular/core';
import {
  a1Promise2Observable,
  AugmentedKeywordsService,
  DialogsService,
  FunctionDialogsConfig,
  IsUsedByDialogService,
  Function as Keyword,
} from '@exense/step-core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { FunctionDialogsConfigFactoryService } from '../../../function/services/function-dialogs-config-factory.service';
import { FunctionDialogsService } from '../../../function/services/function-dialogs.service';

@Injectable({
  providedIn: 'root',
})
export class GenericFunctionDialogService {
  private _functionDialogsConfigFactoryService = inject(FunctionDialogsConfigFactoryService);
  private _functionDialogs = inject(FunctionDialogsService);
  private _dialogs = inject(DialogsService);
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _augmentedKeywordsService = inject(AugmentedKeywordsService);

  private config?: FunctionDialogsConfig;

  configure(options?: { title?: string; serviceRoot?: string; filterClass?: string[] }): void {
    this.config = this._functionDialogsConfigFactoryService.getConfigObject(
      options?.title ?? '',
      options?.serviceRoot ?? 'functions',
      options?.filterClass ?? [],
      true,
      'functionTable'
    );
  }

  openAddMaskDialog(): Observable<Keyword | undefined> {
    return this._functionDialogs.openAddFunctionModal(this.config);
  }

  openEditMaskDialog(keyword: Keyword): void {
    this._functionDialogs.openFunctionEditor(keyword, this.config).subscribe();
  }

  openLookupDialog(id: string, name: string): void {
    this._isUsedByDialogs.displayDialog(`Keyword "${name}" is used by`, 'KEYWORD_ID', id);
  }

  openConfigDialog(id: string): Observable<Keyword | undefined> {
    return this._functionDialogs.configureFunction(id, this.config);
  }

  openDeleteDialog(id: string, name: string): Observable<boolean> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Keyword "${name}"`)).pipe(
      map(() => true),
      catchError(() => of(false)),
      switchMap((isDeleteConfirmed) =>
        isDeleteConfirmed ? this._augmentedKeywordsService.deleteFunction(id).pipe(map(() => true)) : of(false)
      )
    );
  }
}
