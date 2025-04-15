import { Component, inject } from '@angular/core';
import { ErrorsViewStateService } from '../../injectables/errors-view-state.service';
import { ErrorsService } from '../../injectables/errors.service';
import { CustomComponent, StepCoreModule } from '@exense/step-core';

@Component({
  selector: 'step-error-icon',
  standalone: true,
  imports: [StepCoreModule],
  templateUrl: './error-icon.component.html',
  styleUrl: './error-icon.component.scss',
})
export class ErrorIconComponent implements CustomComponent {
  protected readonly _state = inject(ErrorsViewStateService);
  protected readonly _errors = inject(ErrorsService);
  context?: any;
}
