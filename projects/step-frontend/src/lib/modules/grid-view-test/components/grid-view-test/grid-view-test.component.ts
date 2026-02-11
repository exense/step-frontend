import { Component, model, signal } from '@angular/core';
import { provideGridLayoutConfig, StepCoreModule } from '@exense/step-core';
import { ExecutionModule } from '../../../execution/execution.module';

@Component({
  selector: 'step-grid-view-test',
  imports: [StepCoreModule, ExecutionModule],
  templateUrl: './grid-view-test.component.html',
  styleUrl: './grid-view-test.component.scss',
  providers: [provideGridLayoutConfig('gridTest')],
})
export class GridViewTestComponent {
  readonly editMode = model(false);

  readonly areErrorsVisible = signal(false);
  readonly areTestCasesVisible = signal(true);
}
