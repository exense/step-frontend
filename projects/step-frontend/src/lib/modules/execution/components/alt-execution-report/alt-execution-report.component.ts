import { Component, DestroyRef, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { IS_SMALL_SCREEN, ReportNode, TimeRange } from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

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
export class AltExecutionReportComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  protected readonly _mode = inject(VIEW_MODE);
  private _router = inject(Router);

  protected readonly _state = inject(AltExecutionStateService);

  protected readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  protected readonly keywordsSummary$ = inject(AltKeywordNodesStateService).summary$;
  protected readonly testCasesSummary$ = inject(AltTestCasesNodesStateService).summary$;
  protected readonly hasTestCases$ = this._state.testCases$.pipe(map((testCases) => !!testCases?.length));

  private _urlParamsService = inject(DashboardUrlParamsService);
  private _destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this._state.timeRangeChange$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((timeRange) => {
      // update URL every time the page is accessed
      this._urlParamsService.updateUrlParams(timeRange);
    });
  }

  protected handleOpenNodeInTreeView(keyword: ReportNode): void {
    const artefactId = keyword.artefactID;
    if (!artefactId) {
      return;
    }
    this._router.navigate(['..', 'tree'], { queryParams: { artefactId }, relativeTo: this._activatedRoute });
  }

  /*
  protected handleOpenKeywordDrilldown(keyword: ReportNode): void {
    const id = keyword.id;
    if (!id) {
      return;
    }
    this._router.navigate(['..', 'keyword-drilldown', id], { relativeTo: this._activatedRoute });
  }
*/

  handleChartZooming(range: TimeRange) {
    this._state.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: range });
  }

  protected readonly ViewMode = ViewMode;
}
