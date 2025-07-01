import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { AlertType, StepCoreModule } from '@exense/step-core';
import { ErrorsViewStateService } from '../../injectables/errors-view-state.service';
import { UniqueErrorsPipe } from '../../pipes/unique-errors.pipe';

@Component({
  selector: 'step-error-view-dialog',
  standalone: true,
  imports: [StepCoreModule, UniqueErrorsPipe],
  templateUrl: './error-view-dialog.component.html',
  styleUrl: './error-view-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ErrorViewDialogComponent {
  protected readonly _state = inject(ErrorsViewStateService);
  protected readonly AlertType = AlertType;
}
