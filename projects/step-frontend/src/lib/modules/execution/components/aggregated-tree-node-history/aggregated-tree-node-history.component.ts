import { Component, computed, effect, inject, input, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import {
  BucketAttributes,
  Execution,
  ExecutionsService,
  FetchBucketsRequest,
  STATUS_COLORS,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { map, Observable, switchMap, take } from 'rxjs';
import { TreeNodePieChartSlice } from './execution-piechart/aggregated-tree-node-statuses-piechart.component';
import { Status } from '../../../_common/shared/status.enum';

interface ExecutionItem {
  execution: Execution;
  statusSlices: TreeNodePieChartSlice[];
  statusesCount: Record<string, number>;
}

interface HistoryChainData {
  previousExecutions: ExecutionItem[];
  currentExecution: ExecutionItem;
}

@Component({
  selector: 'step-aggregated-tree-node-history',
  templateUrl: './aggregated-tree-node-history.component.html',
  styleUrl: './aggregated-tree-node-history.component.scss',
  standalone: false,
})
export class AggregatedTreeNodeHistoryComponent implements OnInit {
  readonly artefactHash = input.required<string>();
  readonly previousExecutionsCount = input.required<number>();
  protected _executionService = inject(ExecutionsService);
  private _executionState = inject(AltExecutionStateService);
  private _timeSeriesService = inject(TimeSeriesService);
  private _statusColors = inject(STATUS_COLORS);

  previousExecutions = this._executionState.execution$.pipe(
    take(1),
    switchMap((ex) =>
      (ex.executionTaskID
        ? this.fetchLastExecutionsByTask(ex.startTime! - 1, ex.executionTaskID)
        : this.fetchLastExecutionsByPlan(ex.startTime! - 1, ex.planId!)
      ).pipe(map((lastExecutions) => [ex, ...lastExecutions].reverse())),
    ),
  );

  historyArtefactsData: Observable<HistoryChainData> = this.previousExecutions.pipe(
    switchMap((executions) => {
      const executionsIdsJoined = executions.map((e) => `attributes.executionId = ${e.id!}`).join(' or ') || '1 = 1';
      const request: FetchBucketsRequest = {
        start: 0,
        end: new Date().getTime(),
        numberOfBuckets: 1,
        oqlFilter: `(attributes.artefactHash = ${this.artefactHash()}) and (${executionsIdsJoined})`,
        groupDimensions: ['executionId', 'status'],
      };
      return this._timeSeriesService.getReportNodesTimeSeries(request).pipe(
        map((response) => {
          const slicesByExecution: Record<string, TreeNodePieChartSlice[]> = {};
          response.matrixKeys.forEach((key: BucketAttributes, i: number) => {
            const eId = key['executionId'];
            const status: any = key['status'];
            const value = response.matrix[i][0].count;
            const color = this._statusColors[status as Status] || this._statusColors['TECHNICAL_ERROR'];
            const newSlice: TreeNodePieChartSlice = { label: status, color: color, count: value };
            let currentSlices = slicesByExecution[eId];
            if (!currentSlices) {
              currentSlices = [];
              slicesByExecution[eId] = currentSlices;
            }
            currentSlices.push(newSlice);
          });
          return slicesByExecution;
        }),
        switchMap((slices) => {
          const allExecutions: ExecutionItem[] = executions.map((e) => ({
            execution: e,
            statusSlices: slices[e.id!],
            statusesCount: Object.fromEntries((slices[e.id!] || []).map((s) => [s.label, s.count])),
          }));
          return this._executionState.execution$.pipe(
            map((currentExecution) => ({
              previousExecutions: allExecutions.slice(0, -1), // remove the current execution
              currentExecution: {
                execution: currentExecution,
                statusSlices: slices[currentExecution.id!],
                statusesCount: Object.fromEntries(slices[currentExecution.id!].map((s) => [s.label, s.count])),
              },
            })),
          );
        }),
      );
    }),
  );

  private fetchLastExecutionsByPlan(beforeTime: number, planId: string): Observable<Execution[]> {
    return this._executionService.findByCritera({
      criteria: { planId: planId },
      limit: this.previousExecutionsCount(),
      start: '0',
      end: beforeTime.toString(),
    });
  }

  private fetchLastExecutionsByTask(beforeTime: number, taskId: string): Observable<Execution[]> {
    return this._executionService.getLastExecutionsByTaskId(taskId, this.previousExecutionsCount(), 0, beforeTime);
  }

  ngOnInit(): void {
    this.previousExecutions.subscribe((executions) => {
      const executionIds: string[] = executions.map((e) => e.id!);
      this.fetchTimeSeriesArtefactsData(executionIds).subscribe((response) => {
        const slicesByExecution: Record<string, TreeNodePieChartSlice> = {};
        response.matrixKeys.forEach((key: BucketAttributes, i: number) => {
          const eId = key['executionId'];
          const status: any = key['status'];
          const value = response.matrix[i][0].count;
          const color = this._statusColors[status as Status] || this._statusColors['SKIPPED'];
          slicesByExecution[eId] = { label: status, color: color, count: value };
        });
      });
    });
  }

  private fetchTimeSeriesArtefactsData(executionIds: string[]): Observable<TimeSeriesAPIResponse> {
    const executionsIdsJoined = executionIds.map((eId) => `attributes.executionId = ${eId!}`).join(' or ') || '1 = 1';
    const request: FetchBucketsRequest = {
      start: 0,
      end: new Date().getTime(),
      numberOfBuckets: 1,
      oqlFilter: `(attributes.artefactHash = ${this.artefactHash()!}) and (${executionsIdsJoined})`,
      groupDimensions: ['executionId', 'status'],
    };
    return this._timeSeriesService.getReportNodesTimeSeries(request);
  }
}
