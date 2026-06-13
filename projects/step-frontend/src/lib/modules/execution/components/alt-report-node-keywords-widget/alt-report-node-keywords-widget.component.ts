import { Component, inject, ViewEncapsulation } from '@angular/core';
import { VIEW_MODE } from '../../shared/view-mode';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { ReportNode } from '@exense/step-core';
import { DrilldownRootType } from '../../shared/drilldown-root-type';
import { AltReportNodeListProvideKeywordsDirective } from '../../directives/alt-report-node-list-provide-keywords.directive';
import {
  ALT_REPORT_NODE_KEYWORDS_TABLE_ID,
  ALT_REPORT_NODE_LIST_DEFAULT_PAGE_SIZE,
} from '../../shared/alt-report-node-keywords-list-config.tokens';

@Component({
  selector: 'step-alt-report-node-keywords-widget',
  templateUrl: './alt-report-node-keywords-widget.component.html',
  styleUrl: './alt-report-node-keywords-widget.component.scss',
  hostDirectives: [AltReportNodeListProvideKeywordsDirective],
  providers: [
    {
      provide: ALT_REPORT_NODE_KEYWORDS_TABLE_ID,
      useValue: 'keywords',
    },
    {
      provide: ALT_REPORT_NODE_LIST_DEFAULT_PAGE_SIZE,
      useValue: 100,
    },
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AltReportNodeKeywordsWidgetComponent {
  protected readonly _mode = inject(VIEW_MODE);

  private _dialogs = inject(AltExecutionDialogsService);

  protected openDetails(node: ReportNode): void {
    this._dialogs.openIterationDetails(DrilldownRootType.KEYWORDS, node);
  }

  protected openMaximized(): void {
    this._dialogs.openDrilldownRoot(DrilldownRootType.KEYWORDS);
  }
}
