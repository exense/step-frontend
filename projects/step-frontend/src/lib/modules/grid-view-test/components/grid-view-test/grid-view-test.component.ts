import { Component } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { ExecutionModule } from '../../../execution/execution.module';

@Component({
  selector: 'step-grid-view-test',
  imports: [StepCoreModule, ExecutionModule],
  templateUrl: './grid-view-test.component.html',
  styleUrl: './grid-view-test.component.scss',
})
export class GridViewTestComponent {}
