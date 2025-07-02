import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AceMode } from '@exense/step-core';
import { from } from 'rxjs';

@Component({
  selector: 'step-plan-source',
  templateUrl: './plan-source-dialog.component.html',
  styleUrls: ['./plan-source-dialog.component.scss'],
  standalone: false,
})
export class PlanSourceDialogComponent {
  private _snackBar = inject(MatSnackBar);
  private _clipboard = inject(DOCUMENT).defaultView!.navigator.clipboard;
  protected _planSource = inject<string>(MAT_DIALOG_DATA);

  protected readonly AceMode = AceMode;

  copyToClipboard(): void {
    from(this._clipboard.writeText(this._planSource)).subscribe(() => {
      this._snackBar.open(`Plan's YAML copied to clipboard.`, 'dismiss');
    });
  }
}
