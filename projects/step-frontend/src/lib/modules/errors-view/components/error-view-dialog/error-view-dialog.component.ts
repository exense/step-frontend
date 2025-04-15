import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { AlertType, StepCoreModule } from '@exense/step-core';
import { ErrorsViewStateService } from '../../injectables/errors-view-state.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'step-error-view-dialog',
  standalone: true,
  imports: [StepCoreModule],
  templateUrl: './error-view-dialog.component.html',
  styleUrl: './error-view-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ErrorViewDialogComponent {
  private _dialogRef = inject(MatDialogRef);
  protected readonly _state = inject(ErrorsViewStateService);
  protected readonly AlertType = AlertType;

  protected dismissAll(): void {
    this._state.dismissAll();
    this._dialogRef.close();
  }
}
