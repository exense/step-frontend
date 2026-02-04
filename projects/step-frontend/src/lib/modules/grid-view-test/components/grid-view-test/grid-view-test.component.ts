import { Component, model, signal } from '@angular/core';
import { provideGridLayoutConfig, StepCoreModule } from '@exense/step-core';
import { ExecutionModule } from '../../../execution/execution.module';

@Component({
  selector: 'step-grid-view-test',
  imports: [StepCoreModule, ExecutionModule],
  templateUrl: './grid-view-test.component.html',
  styleUrl: './grid-view-test.component.scss',
  providers: [
    provideGridLayoutConfig('gridTest', [
      { id: 'errorsWidget', title: 'Errors widget', widthInCells: 8, heightInCells: 1, weight: 1 },
      { id: 'testCases', title: 'Test Cases', widthInCells: 6, heightInCells: 3, weight: 1 },
      { id: 'testCasesSummary', title: 'Summary: Test Cases', widthInCells: 2, heightInCells: 3, weight: 1 },
      { id: 'keywordsSummary', title: 'Summary: Keyword Calls', widthInCells: 2, heightInCells: 3, weight: 1 },
      { id: 'keywordsList', title: 'Keywords', widthInCells: 6, heightInCells: 3, weight: 1 },
    ]),
  ],
})
export class GridViewTestComponent {
  readonly editMode = model(false);

  readonly areErrorsVisible = signal(false);
  readonly areTestCasesVisible = signal(true);
}
