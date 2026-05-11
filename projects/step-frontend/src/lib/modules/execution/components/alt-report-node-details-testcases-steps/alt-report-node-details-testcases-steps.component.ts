import { Component, effect, inject, input, output, signal } from '@angular/core';
import { AltTestCasesDetailsNodesStateService } from '../../services/alt-test-cases-details-nodes-state.service';
import { AltReportNodeListProvideTestcasesDetailsDirective } from '../../directives/alt-report-node-list-provide-testcases-details.directive';
import { ElementSizeDirective, ReportNode } from '@exense/step-core';

@Component({
  selector: 'step-alt-report-node-details-testcases-steps',
  templateUrl: './alt-report-node-details-testcases-steps.component.html',
  styleUrl: './alt-report-node-details-testcases-steps.component.scss',
  standalone: false,
  hostDirectives: [AltReportNodeListProvideTestcasesDetailsDirective, ElementSizeDirective],
})
export class AltReportNodeDetailsTestcasesStepsComponent {
  protected readonly _state = inject(AltTestCasesDetailsNodesStateService);

  readonly testCaseId = input<string>();
  protected readonly selectedReportNodeId = signal<string | undefined>(undefined);

  private effectTestCaseIdChange = effect(() => {
    const testCaseId = this.testCaseId();
    this._state.setTestCaseId(testCaseId);
  });

  readonly openDetails = output<ReportNode>();

  protected handleOpenDetails(reportNode: ReportNode): void {
    this.selectedReportNodeId.set(reportNode.id);
    this.openDetails.emit(reportNode);
  }
}
