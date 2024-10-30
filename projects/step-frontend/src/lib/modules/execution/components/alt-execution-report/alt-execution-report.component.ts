import { Component, inject, ViewEncapsulation } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { IS_SMALL_SCREEN, ReportNode } from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';

@Component({
  selector: 'step-alt-execution-report',
  templateUrl: './alt-execution-report.component.html',
  styleUrl: './alt-execution-report.component.scss',
  providers: [
    {
      provide: VIEW_MODE,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return (_activatedRoute.snapshot.data['mode'] ?? ViewMode.VIEW) as ViewMode;
      },
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionReportComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  readonly _state = inject(AltExecutionStateService);

  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  readonly keywordsSummary$ = inject(AltKeywordNodesStateService).summary$;
  readonly testCasesSummary$ = inject(AltTestCasesNodesStateService).summary$;

  readonly _mode = inject(VIEW_MODE);

  handleOpenKeywordInTreeView(keyword: ReportNode): void {
    const artefactId = keyword.artefactID;
    if (!artefactId) {
      return;
    }
    this._router.navigate(['..', 'tree'], { queryParams: { artefactId }, relativeTo: this._activatedRoute });
  }

  handleOpenKeywordDrilldown(keyword: ReportNode): void {
    const id = keyword.id;
    if (!id) {
      return;
    }
    this._router.navigate(['..', 'keyword-drilldown', id], { relativeTo: this._activatedRoute });
  }

  protected readonly ViewMode = ViewMode;
}
