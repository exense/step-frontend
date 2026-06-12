import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CrossExecutionDashboardState} from '../cross-execution-dashboard-state';
import {Tab} from '@exense/step-core';
import {take} from 'rxjs';
import {Router} from '@angular/router';

export type ReportNodesChartType = 'keywords' | 'testcases';

@Component({
  selector: 'step-cross-execution-call-counts',
  templateUrl: './cross-execution-call-counts.component.html',
  styleUrl: './cross-execution-call-counts.component.scss',
  standalone: false
})
export class CrossExecutionCallCountsComponent implements OnInit {
  private _router = inject(Router);
  protected _state = inject(CrossExecutionDashboardState);

  protected readonly reportNodesChartType = signal<ReportNodesChartType | undefined>(undefined);

  protected readonly countChartTitle = computed(() => {
    const label = this.reportNodesChartType() === 'keywords' ? 'Keyword calls count' : 'Test cases count';
    return `${label} (last ${this._state.LAST_EXECUTIONS_TO_DISPLAY} executions)`;
  });

  protected readonly primaryChartTypes: Tab<ReportNodesChartType>[] = [
    {
      id: 'testcases',
      label: 'Test Cases',
    },
    {
      id: 'keywords',
      label: 'Keywords',
    },
  ];

  ngOnInit(): void {
    this._state.testCasesChartSettings$.pipe(take(1)).subscribe(({ hasData }) => {
      this.reportNodesChartType.set(hasData ? 'testcases' : 'keywords');
    });
  }

  protected switchReportNodesChart(type: ReportNodesChartType): void {
    if (this.reportNodesChartType() === type) {
      // nothing happened
      return;
    }
    this._state.lastRefreshTrigger.set('manual');
    if (type === 'keywords') {
      this._state.keywordsCountChartLoading.set(true);
    } else {
      this._state.testCasesCountChartLoading.set(true);
    }
    this.reportNodesChartType.set(type);
  }

  protected jumpToExecution(eId: string): void {
    this._router.navigate(['executions', eId, 'report']);
  }
}
