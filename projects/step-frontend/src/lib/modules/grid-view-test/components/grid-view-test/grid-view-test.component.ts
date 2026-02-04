import { Component, model, signal } from '@angular/core';
import { provideGridLayoutConfig, StepCoreModule } from '@exense/step-core';
import { ExecutionModule } from '../../../execution/execution.module';

@Component({
  selector: 'step-grid-view-test',
  imports: [StepCoreModule, ExecutionModule],
  templateUrl: './grid-view-test.component.html',
  styleUrl: './grid-view-test.component.scss',
  providers: [
    provideGridLayoutConfig('gridTest', {
      errorsWidget: { title: 'Errors widget', position: { row: 1, column: 1, widthInCells: 8, heightInCells: 1 } },
      testCases: { title: 'Test Cases', position: { row: 2, column: 1, widthInCells: 6, heightInCells: 3 } },
      testCasesSummary: {
        title: 'Summary: Test Cases',
        position: { row: 2, column: 7, widthInCells: 2, heightInCells: 3 },
      },
      keywordsSummary: {
        title: 'Summary: Keyword Calls',
        position: { row: 5, column: 1, widthInCells: 2, heightInCells: 3 },
      },
      keywordsList: { title: 'Keywords', position: { row: 5, column: 3, widthInCells: 6, heightInCells: 3 } },
    }),
  ],
})
export class GridViewTestComponent {
  readonly editMode = model(false);

  readonly areErrorsVisible = signal(false);
  readonly areTestCasesVisible = signal(true);
}
