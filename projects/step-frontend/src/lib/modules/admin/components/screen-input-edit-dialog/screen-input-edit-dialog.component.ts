import { Component, DestroyRef, HostBinding, inject } from '@angular/core';
import {
  AugmentedScreenService,
  DialogRouteResult,
  Input as SInput,
  TableColumnsDefaultVisibilityService,
} from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ScreenInputEditDialogData } from '../../types/screen-input-edit-dialog-data.interface';
import { CUSTOM_UI_COMPONENTS_FORMATTER, EXPRESSION_SCRIPT_FORMATTER } from '../../types/model-formatters';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';

type InputType = SInput['type'];
type DialogRef = MatDialogRef<ScreenInputEditDialogComponent, DialogRouteResult>;

@Component({
  selector: 'step-screen-input-edit-dialog',
  templateUrl: './screen-input-edit-dialog.component.html',
  styleUrls: ['./screen-input-edit-dialog.component.scss'],
})
export class ScreenInputEditDialogComponent {
  private _screenApi = inject(AugmentedScreenService);
  private _matDialogRef = inject<DialogRef>(MatDialogRef);
  private _dialogData = inject<ScreenInputEditDialogData>(MAT_DIALOG_DATA);
  private _destroyRef = inject(DestroyRef);
  private _route = inject(ActivatedRoute);
  private _tableColumnsDefaultVisibility = inject(TableColumnsDefaultVisibilityService);
  protected screenInput = this._dialogData.screenInput;
  private isNew = !this.screenInput?.id;
  readonly modalTitle = `${this.isNew ? 'New' : 'Edit'} Input`;
  readonly ALLOWED_TYPES: InputType[] = ['DROPDOWN', 'TEXT', 'CHECKBOX'];

  protected showAdvanced = false;
  protected inProgress = false;

  readonly customUIComponentsFormatter = CUSTOM_UI_COMPONENTS_FORMATTER;
  readonly activationExpressionFormatter = EXPRESSION_SCRIPT_FORMATTER;

  @HostBinding('keydown.enter')
  save(): void {
    this.inProgress = true;
    this._route.queryParams
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        switchMap((data) => {
          this.screenInput.position = data['nextIndex'];
          return this._screenApi.saveInput(this.screenInput);
        }),
        switchMap((savedInput) => {
          if (!this.isNew) {
            return of(undefined);
          }
          return this._tableColumnsDefaultVisibility.setupDefaultVisibilityForScreenInputColumn(savedInput);
        }),
      )
      .subscribe({
        next: () => this._matDialogRef.close({ isSuccess: true }),
        complete: () => (this.inProgress = false),
      });
  }
}
