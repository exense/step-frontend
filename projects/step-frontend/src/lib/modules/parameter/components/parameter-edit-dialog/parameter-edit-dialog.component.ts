import { Component, HostListener, inject, OnInit, TrackByFunction } from '@angular/core';
import {
  AugmentedParametersService,
  AugmentedScreenService,
  AuthService,
  DateFormat,
  Parameter,
} from '@exense/step-core';
import { ParameterScopeRendererService } from '../../services/parameter-scope-renderer.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { combineLatest, iif, map, of, tap } from 'rxjs';
import { SCOPE_ITEMS, ScopeItem } from '../../types/scope-items.token';

@Component({
  selector: 'step-parameter-edit-dialog',
  templateUrl: './parameter-edit-dialog.component.html',
  styleUrls: ['./parameter-edit-dialog.component.scss'],
})
export class ParameterEditDialogComponent implements OnInit {
  readonly DateFormat = DateFormat;
  protected parameter?: Parameter;
  protected scopeItems: ScopeItem[] = [];
  protected selectedScope?: ScopeItem;
  protected protectedParameter: boolean = false;
  private _authService = inject(AuthService);
  private _allScopeItems = inject(SCOPE_ITEMS);
  private _matDialogRef = inject(MatDialogRef);
  private _api = inject(AugmentedParametersService);
  private _screenApi = inject(AugmentedScreenService);
  private _parameterScopeRenderer = inject(ParameterScopeRendererService);
  private _parameterId = inject<string | undefined>(MAT_DIALOG_DATA, { optional: true });
  readonly isEditMode = !!this._parameterId;
  readonly modalTitle = `${this.isEditMode ? 'Edit' : 'New'} Parameter`;

  readonly trackByScopeItem: TrackByFunction<ScopeItem> = (_, item) => item.scope;

  ngOnInit(): void {
    this.initParameter();
    this.initScopeItems();
  }

  @HostListener('keydown.enter')
  save(): void {
    this._api.saveParameter(this.parameter).subscribe((parameter) => {
      this._matDialogRef.close(parameter);
    });
  }

  selectScope(scopeItem: ScopeItem): void {
    if (!this.parameter) {
      return;
    }
    this.parameter.scopeEntity = '';
    this.parameter.scope = scopeItem.scope;
    this.selectedScope = scopeItem;
  }

  private initParameter(): void {
    const createNew$ = this._api.newParameter();

    const openForEdit$ = this._api.getParameterById(this._parameterId!).pipe(
      tap((parameter) => {
        if (!parameter.scope) {
          parameter.scope = this._parameterScopeRenderer.normalizeScope(parameter.scope);
        }
        this.protectedParameter = !!parameter.protectedValue;
      })
    );

    iif(() => this.isEditMode, openForEdit$, createNew$).subscribe((parameter) => {
      this.parameter = parameter;
      this.selectedScope = this._allScopeItems.find((item) => item.scope === parameter.scope);
    });
  }

  private initScopeItems(): void {
    const scopeItems$ = of(this._allScopeItems);
    const hasGlobal$ = of(this._authService.hasRight('param-global-write'));
    const isApplicationScopeEnabled$ = this._screenApi
      .getInputForScreen('functionTable', 'attributes.application')
      .pipe(map((input) => !!input));

    combineLatest([scopeItems$, hasGlobal$, isApplicationScopeEnabled$])
      .pipe(
        map(([scopeItems, hasGlobal, hasApplication]) => {
          return scopeItems.filter(
            (item) => (item.scope !== 'GLOBAL' || hasGlobal) && (item.scope !== 'APPLICATION' || hasApplication)
          );
        })
      )
      .subscribe((scopeItems) => (this.scopeItems = scopeItems));
  }

  onKeyChange(key: string) {
    if (!this.parameter) {
      return;
    }
    this.parameter.key = key;
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('pwd') || lowerKey.includes('password')) {
      this.parameter.protectedValue = true;
    }
  }
}
