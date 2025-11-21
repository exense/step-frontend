import { Component, computed, effect, inject, untracked } from '@angular/core';
import {
  AugmentedControllerService,
  BaseReportDetailsComponent,
  DateFormat,
  Measure,
  ReportNode,
  TableDataSource,
  TableRemoteDataSourceFactoryService,
} from '@exense/step-core';
import { KeywordReportNode } from '../../types/keyword.report-node';
import { DOCUMENT } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { ReportNodeType } from '../../../report-nodes/shared/report-node-type.enum';
import { AltExecutionStateService } from '../../../execution/services/alt-execution-state.service';

@Component({
  selector: 'step-call-keyword-report-details',
  templateUrl: './call-keyword-report-details.component.html',
  styleUrl: './call-keyword-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  standalone: false,
})
export class CallKeywordReportDetailsComponent extends BaseReportDetailsComponent<KeywordReportNode> {
  private _controllerService = inject(AugmentedControllerService);
  private _altExecutionState = inject(AltExecutionStateService, { optional: true });
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _window = inject(DOCUMENT).defaultView!;

  private reportNodesToRender = new Set([
    ReportNodeType.ASSERT_REPORT_NODE,
    ReportNodeType.PERFORMANCE_ASSERT_REPORT_NODE,
    ReportNodeType.CHECK_REPORT_NODE,
    ReportNodeType.SET_REPORT_NODE,
  ]);

  protected readonly execution = toSignal(this._altExecutionState?.execution$ ?? of(undefined), {
    initialValue: undefined,
  });

  protected keywordInputs = computed(() => {
    const context = this.node();
    let result: Record<string, unknown> | undefined = undefined;
    if (!context?.input) {
      return result;
    }
    try {
      const json = JSON.parse(context.input);
      if (Object.keys(json).length) {
        result = json;
      }
    } catch (e) {}
    return result;
  });

  protected keywordOutputs = computed(() => {
    const context = this.node();
    let result: Record<string, unknown> | undefined = undefined;
    if (!context?.output) {
      return result;
    }
    try {
      const json = JSON.parse(context.output);
      if (Object.keys(json).length) {
        result = json;
      }
    } catch (e) {}
    return result;
  });

  private failedChildren$ = toObservable(this.node).pipe(
    switchMap((node) => {
      if (!node || node.status !== 'FAILED') {
        return of(undefined);
      }
      return this._controllerService.getReportNodeChildren(node.id!).pipe(catchError(() => of(undefined)));
    }),
    map((children: ReportNode[] | undefined) => {
      return (children ?? []).filter(
        (child) => this.reportNodesToRender.has(child._class as ReportNodeType) && child.status !== 'PASSED',
      );
    }),
  );

  protected readonly failedChildren = toSignal(this.failedChildren$, { initialValue: [] });

  /**
   * Extract nodeId, to prevent unnecessary dataSource recreation
   * **/
  private nodeId = computed(() => {
    const node = this.node();
    return node?.id;
  });

  protected readonly measuresDataSource = computed(() => {
    const id = this.nodeId();
    if (!id) {
      return undefined;
    }
    return this.createMeasurementsDataSource(id);
  });

  /**
   * Add additional effect to refresh dataSource when node changes, event id is the same
   * **/
  private effectRefreshMeasurements = effect(() => {
    const node = this.node();
    const measuresDataSource = untracked(() => this.measuresDataSource());
    measuresDataSource?.reload?.();
  });

  protected copyInput(): void {
    this.copyToClipboard(this.node()?.input);
  }

  protected copyOutput(): void {
    this.copyToClipboard(this.node()?.output);
  }

  protected navigateToAnalyticsView(measure: Measure): void {
    const execution = this.execution();
    if (!execution) {
      return;
    }
    const start = execution.startTime!;
    const executionInProgress = !execution.endTime;
    const params: Record<string, string> = {
      dc_rangeType: 'ABSOLUTE',
      dc_q_eId: execution.id!,
      dc_q_name: measure.name!,
      dc_from: start.toString(),
      dc_refreshInterval: executionInProgress ? '1' : '0',
    };
    if (!executionInProgress) {
      params['dc_to'] = execution.endTime!.toString();
    }
    const paramsString = new URLSearchParams(params).toString();
    const url = `/#/analytics?${paramsString}`;
    this._window.open(url, '_blank');
  }

  private createMeasurementsDataSource(reportNodeId: string): TableDataSource<Measure> {
    return this._dataSourceFactory.createDataSource(
      'reportMeasurements',
      {
        begin: 'begin',
        name: 'name',
        duration: 'duration',
      },
      {
        rnId: reportNodeId,
      },
    );
  }

  protected readonly DateFormat = DateFormat;
}
