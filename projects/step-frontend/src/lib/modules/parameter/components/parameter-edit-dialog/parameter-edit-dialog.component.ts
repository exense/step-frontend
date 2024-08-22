import { Component, HostListener, inject, OnInit } from '@angular/core';
import {
  AugmentedParametersService,
  AugmentedScreenService,
  AuthService,
  DateFormat,
  DialogRouteResult,
  Parameter,
  ScreensService,
} from '@exense/step-core';
import { ParameterScopeRendererService } from '../../services/parameter-scope-renderer.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { combineLatest, delay, map, of, switchMap, take } from 'rxjs';
import { SCOPE_ITEMS, ScopeItem } from '../../types/scope-items.token';
import { MatSnackBar } from '@angular/material/snack-bar';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogCommunicationService } from '../../services/dialog-communication.service';
import { ParameterConditionDialogComponent } from '../parameter-condition-dialog/parameter-condition-dialog.component';

interface ParameterEditDialogData {
  entity: Parameter;
  isNew: boolean;
}

@Component({
  selector: 'step-parameter-edit-dialog',
  templateUrl: './parameter-edit-dialog.component.html',
  styleUrls: ['./parameter-edit-dialog.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('hidden <=> visible', animate('300ms ease-in-out')),
    ]),
  ],
})
export class ParameterEditDialogComponent implements OnInit {
  animationState: 'visible' | 'hidden' = 'visible';
  private _dialogData = inject<ParameterEditDialogData>(MAT_DIALOG_DATA);
  private _authService = inject(AuthService);
  private _allScopeItems = inject(SCOPE_ITEMS);
  private _matDialogRef = inject<MatDialogRef<ParameterEditDialogData, DialogRouteResult>>(MatDialogRef);
  private _api = inject(AugmentedParametersService);
  private _screenApi = inject(AugmentedScreenService);
  private _parameterScopeRenderer = inject(ParameterScopeRendererService);
  private _matDialog = inject(MatDialog);
  private _screenService = inject(ScreensService);
  private _snackBar = inject(MatSnackBar);
  private _dialogCommunicationService = inject(DialogCommunicationService);

  protected parameter = this._dialogData.entity;

  readonly DateFormat = DateFormat;
  readonly isEditMode = !this._dialogData.isNew;

  protected scopeItems: ScopeItem[] = [];
  protected selectedScope?: ScopeItem;
  protected protectedParameter = false;

  readonly modalTitle = `${this.isEditMode ? 'Edit' : 'New'} Parameter`;

  ngOnInit(): void {
    this.initParameter();
    this.initScopeItems();
  }

  @HostListener('keydown.enter', ['$event'])
  save(event?: KeyboardEvent): void {
    if (
      (!!event?.target && event.target instanceof HTMLTextAreaElement) ||
      (this.parameter?.scope === 'GLOBAL' && !this._authService.hasRight('param-global-write'))
    ) {
      return;
    }

    this._api.saveParameter(this.parameter).subscribe((parameter) => {
      this._matDialogRef.close({ isSuccess: !!parameter });
    });
  }

  addCondition(type?: string) {
    this._screenService
      .getScreenInputsByScreenId('executionParameters')
      .pipe(
        take(1),
        switchMap((inputs) => {
          const dialogRef = this._matDialog.open(ParameterConditionDialogComponent, {
            data: { type, inputs },
            width: '50rem',
          });

          return dialogRef.afterClosed();
        }),
      )
      .subscribe((result) => {
        const script = this.createGroovyExpression(result);
        let tempScript = '';
        if (result) {
          switch (type) {
            case 'OR':
              tempScript = this.parameter.activationExpression!.script!;
              this.parameter.activationExpression!.script! = `${tempScript} || ${script}`;
              break;
            case 'AND':
              tempScript = this.parameter.activationExpression!.script!;
              this.parameter.activationExpression!.script! = `${tempScript} && ${script}`;
              break;
            default:
              this.parameter.activationExpression!.script! = script;
          }
        }
      });
  }

  createGroovyExpression(input: any) {
    let result = '';
    const { key, predicate, value } = input;

    switch (predicate) {
      case 'equals':
        result = `${key} == "${value}"`;
        break;
      case 'not_equals':
        result = `${key} != "${value}"`;
        break;
      case 'matches':
        result = `${key} =~ "${value}"`;
        break;
      case 'not_matches':
        result = `${key} !~ "${value}"`;
        break;
      case 'exists':
        result = `${key}`;
        break;
      case 'not_exists':
        result = `!${key}`;
        break;
    }

    return result;
  }

  saveAndNext() {
    this.animationState = 'hidden';
    this._api
      .saveParameter(this.parameter)
      .pipe(
        switchMap((data) => {
          this._snackBar.open(`Parameter ${this.parameter.key} was created succesfully`, 'Ok', {
            duration: 5000,
          });
          return this._api.newParameter();
        }),
        delay(300),
      )
      .subscribe((parameter) => {
        this.animationState = 'visible';
        this.parameter = {
          ...this.parameter,
          id: parameter.id,
          lastModificationDate: parameter.lastModificationDate,
          lastModificationUser: parameter.lastModificationUser,
        };
        this._dialogCommunicationService.triggerDialogAction();
      });
  }

  selectScope(scopeItem: ScopeItem): void {
    if (!this.parameter) {
      return;
    }
    this.parameter.scopeEntity = undefined;
    this.parameter.scope = scopeItem.scope;
    this.selectedScope = scopeItem;
  }

  private initParameter(): void {
    if (this.isEditMode) {
      if (!this.parameter.scope) {
        this.parameter.scope = this._parameterScopeRenderer.normalizeScope(this.parameter.scope);
      }
      this.protectedParameter = !!this.parameter.protectedValue;
    }
    this.selectedScope = this._allScopeItems.find((item) => item.scope === this.parameter.scope);
    this.parameter.activationExpression = this.parameter.activationExpression ?? {};
    this.parameter.activationExpression.script = this.parameter.activationExpression.script ?? '';
  }

  private initScopeItems(): void {
    const scopeItems$ = of(this._allScopeItems);
    const hasGlobal$ = of(this._authService.hasRight('param-global-write'));
    const isApplicationScopeEnabled$ = this._screenApi
      .getInputForScreen('keyword', 'attributes.application')
      .pipe(map((input) => !!input));

    combineLatest([scopeItems$, hasGlobal$, isApplicationScopeEnabled$])
      .pipe(
        map(([scopeItems, hasGlobal, hasApplication]) => {
          return scopeItems.filter(
            (item) => (item.scope !== 'GLOBAL' || hasGlobal) && (item.scope !== 'APPLICATION' || hasApplication),
          );
        }),
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
