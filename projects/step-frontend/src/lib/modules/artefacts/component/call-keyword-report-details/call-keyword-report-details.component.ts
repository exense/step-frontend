import { Component, computed, inject, signal } from '@angular/core';
import {
  AugmentedControllerService,
  CustomComponent,
  DateFormat,
  JsonViewerFormatterService,
  Measure,
  ReportNode,
  TableLocalDataSource,
} from '@exense/step-core';
import { KeywordReportNode } from '../../types/keyword.report-node';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { ReportNodeType } from '../../../report-nodes/shared/report-node-type.enum';
import { AltExecutionStateService } from '../../../execution/services/alt-execution-state.service';

@Component({
  selector: 'step-call-keyword-report-details',
  templateUrl: './call-keyword-report-details.component.html',
  styleUrl: './call-keyword-report-details.component.scss',
})
export class CallKeywordReportDetailsComponent implements CustomComponent {
  private _controllerService = inject(AugmentedControllerService);
  private _formatter = inject(JsonViewerFormatterService);
  private _altExecutionState = inject(AltExecutionStateService, { optional: true });
  private _clipboard = inject(DOCUMENT).defaultView!.navigator.clipboard;

  protected readonly execution = toSignal(this._altExecutionState?.execution$ ?? of(undefined), {
    initialValue: undefined,
  });

  private contextInternal = signal<KeywordReportNode | undefined>(undefined);

  protected node = this.contextInternal.asReadonly();

  protected keywordInputs = computed(() => {
    const context = this.contextInternal();
    let result: Record<string, unknown> | undefined = undefined;
    if (!context?.input) {
      return result;
    }
    try {
      result = JSON.parse(context.input);
    } catch (e) {}
    return result;
  });

  protected keywordOutputs = computed(() => {
    const context = this.contextInternal();
    let result: Record<string, unknown> | undefined = undefined;
    if (!context?.output) {
      return result;
    }
    try {
      result = JSON.parse(context.output);
    } catch (e) {}
    return result;
  });

  protected isInputsExpanded = signal(false);
  protected isOutputsExpanded = signal(false);

  protected toggleInputsExpanded(): void {
    this.isInputsExpanded.update((value) => !value);
  }

  protected toggleOutputsExpanded(): void {
    this.isOutputsExpanded.update((value) => !value);
  }

  private children$ = toObservable(this.contextInternal).pipe(
    switchMap((node) => {
      if (!node || node.status === 'FAILED') {
        return of(undefined);
      }
      return this._controllerService.getReportNodeChildren(node.id!).pipe(catchError(() => of(undefined)));
    }),
    map((children: ReportNode[] | undefined) => {
      return (children ?? []).filter(
        (child) =>
          (child._class === ReportNodeType.ASSERT_REPORT_NODE ||
            child._class === ReportNodeType.PERFORMANCE_ASSERT_REPORT_NODE) &&
          child.status !== 'PASSED',
      );
    }),
    takeUntilDestroyed(),
  );

  protected readonly children = toSignal(this.children$, { initialValue: [] });

  protected readonly measuresDataSource = computed(() => {
    const measures = this.node()?.measures;
    if (!measures?.length) {
      return undefined;
    }
    return new TableLocalDataSource(
      measures,
      TableLocalDataSource.configBuilder<Measure>()
        .addSortNumberPredicate('duration', (item: Measure) => item.duration)
        .build(),
    );
  });

  protected copyInput(): void {
    this.copyToClipboard(this.contextInternal()?.input);
  }

  protected copyOutput(): void {
    this.copyToClipboard(this.contextInternal()?.output);
  }

  protected navigateToAnalyticsView(measure: Measure): void {
    const execution = this.execution();
    if (!execution) {
      return;
    }
    const start = execution.startTime;
    const executionInProgress = !execution.endTime;
    const params: any = {
      executionId: execution.id,
      name: measure.name,
      start: start,
      refresh: executionInProgress ? '1' : '0',
      tsParams: 'eId,name,start,end,refresh',
    };
    if (!executionInProgress) {
      params.end = execution.endTime;
    }
    let paramsString = new URLSearchParams(params).toString();
    const url = `/#/analytics?${paramsString}`;
    window.open(url, '_blank');
  }

  contextChange(previousContext?: KeywordReportNode, currentContext?: KeywordReportNode) {
    this.contextInternal.set(currentContext);
  }

  private copyToClipboard(json?: string): void {
    if (!json) {
      return;
    }
    const formatted = this._formatter.formatToJsonString(json);
    this._clipboard.writeText(formatted);
  }

  protected readonly DateFormat = DateFormat;
}
