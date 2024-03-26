import { Component, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TableColumnsReconfigure } from '../../services/table-columns-reconfigure';
import { AugmentedScreenService, ScreenInput } from '../../../../client/step-client-module';
import {
  CustomColumnEditorDialogComponent,
  CustomColumnEditorDialogOperation,
  CustomColumnEditorDialogResult,
} from '../custom-column-editor-dialog/custom-column-editor-dialog.component';
import { ColumnEditorDialogData } from '../../types/column-editor-dialog-data';
import { filter, map, switchMap } from 'rxjs';
import { TableCustomColumnsService } from '../../services/table-custom-columns.service';

@Component({
  selector: 'step-custom-column-add-button',
  templateUrl: './custom-column-add-button.component.html',
  styleUrl: './custom-column-add-button.component.scss',
})
export class CustomColumnAddButtonComponent {
  private _customColumns = inject(TableCustomColumnsService);
  private _columnsReconfigure = inject(TableColumnsReconfigure);
  private _screenApiService = inject(AugmentedScreenService);
  private _matDialog = inject(MatDialog);

  @Input({ required: true }) screen!: string;

  addColumn(): void {
    const screenInput: ScreenInput = {
      screenId: this.screen,
      input: { type: 'TEXT' },
    };

    this._matDialog
      .open<CustomColumnEditorDialogComponent, ColumnEditorDialogData, CustomColumnEditorDialogResult>(
        CustomColumnEditorDialogComponent,
        { data: { screenInput } },
      )
      .afterClosed()
      .pipe(
        filter((result) => result?.operation === CustomColumnEditorDialogOperation.SAVE),
        map((result) => result!.screenInput),
        switchMap((screenInput) => this._screenApiService.saveInput(screenInput)),
        switchMap(() => this._customColumns.updateColumnsForScreen(this.screen)),
      )
      .subscribe(() => {
        setTimeout(() => {
          this._columnsReconfigure.reconfigureColumns();
        });
      });
  }
}
