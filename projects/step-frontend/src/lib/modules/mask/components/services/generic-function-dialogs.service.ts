import { Injectable } from '@angular/core';
import { a1Promise2Observable, DialogsService, AugmentedKeywordsService } from '@exense/step-core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { FunctionDialogsService } from '../../../function/services/function-dialogs.service';
import { IsUsedByDialogsService } from '../../../_common/services/is-used-by-dialogs.service';
import { IsUsedByType } from '../../../_common/shared/is-used-by-type.enum';

@Injectable({
  providedIn: 'root',
})
export class GenericFunctionDialogService {
  config: any;

  constructor(
    private _functionDialogs: FunctionDialogsService,
    private _isUsedByDialogs: IsUsedByDialogsService,
    private _dialogs: DialogsService,
    private _augmentedKeywordsService: AugmentedKeywordsService
  ) {}

  configure(title?: string, serviceroot?: string, filterclass?: string[]) {
    this.config = this._functionDialogs._functionDialogsConfig.getConfigObject(
      title,
      serviceroot,
      filterclass,
      true,
      'functionTable'
    );
  }

  openAddMaskDialog(): Observable<any> {
    return this._functionDialogs.openAddFunctionModal(this.config);
  }

  openEditMaskDialog(id: string): void {
    this._functionDialogs.openFunctionEditor(id, this.config);
  }

  openLookupDialog(id: string, name: string): Observable<any> {
    return this._isUsedByDialogs.displayDialog(`Keyword "${name}" is used by`, IsUsedByType.KEYWORD_ID, id);
  }

  openConfigDialog(id: string): Observable<any> {
    return this._functionDialogs.configureFunction(id, this.config);
  }

  openDeleteDialog(id: string, name: string): Observable<any> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Keyword "${name}"`)).pipe(
      map((_) => true),
      catchError((_) => of(false)),
      tap((isDeleteConfirmed) => console.log('IS DELETE CONFIRMED', isDeleteConfirmed)),
      switchMap((isDeleteConfirmed) =>
        isDeleteConfirmed ? this._augmentedKeywordsService.deleteFunction(id).pipe(map((_) => true)) : of(false)
      )
    );
  }
}
