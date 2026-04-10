import { Component, inject, ViewEncapsulation } from '@angular/core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { VIEW_MODE } from '../../shared/view-mode';
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { ReportNode } from '@exense/step-core';

@Component({
  selector: 'step-alt-report-node-keywords-widget',
  templateUrl: './alt-report-node-keywords-widget.component.html',
  styleUrl: './alt-report-node-keywords-widget.component.scss',
  providers: [
    {
      provide: AltReportNodesStateService,
      useExisting: AltKeywordNodesStateService,
    },
    {
      provide: AltReportNodesFilterService,
      useExisting: AltReportNodesStateService,
    },
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AltReportNodeKeywordsWidgetComponent {
  protected readonly _mode = inject(VIEW_MODE);

  private _dialogs = inject(AltExecutionDialogsService);

  protected openDetails(node: ReportNode): void {
    this._dialogs.openIterationDetails(node);
  }
}
