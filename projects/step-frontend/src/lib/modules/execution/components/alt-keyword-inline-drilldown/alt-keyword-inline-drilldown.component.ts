import { Component, computed, inject, input } from '@angular/core';
import { AugmentedControllerService, ReportNode, ViewerFormat } from '@exense/step-core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';

interface ReportNodeAddon {
  functionAttributes?: Record<string, string>;
  input?: string | null;
  output?: string | null;
  echo?: string;
  message?: string;
  key?: string;
  value?: string;
  agentUrl?: string;
}

@Component({
  selector: 'step-alt-keyword-inline-drilldown',
  templateUrl: './alt-keyword-inline-drilldown.component.html',
  styleUrl: './alt-keyword-inline-drilldown.component.scss',
})
export class AltKeywordInlineDrilldownComponent {
  private _controllerService = inject(AugmentedControllerService);

  readonly node = input.required<ReportNode & ReportNodeAddon>();

  private children$ = toObservable(this.node).pipe(
    switchMap((node) => {
      if (node.status === 'FAILED') {
        return of(undefined);
      }
      return this._controllerService.getReportNodeChildren(node.id!).pipe(catchError(() => of(undefined)));
    }),
    map((children: ReportNode[] | undefined) => {
      return (children ?? []).filter(
        (child) =>
          (child._class === 'step.artefacts.reports.AssertReportNode' ||
            child._class === 'step.artefacts.reports.PerformanceAssertReportNode') &&
          child.status !== 'PASSED',
      );
    }),
    takeUntilDestroyed(),
  );

  protected readonly children = toSignal(this.children$, { initialValue: [] });

  protected readonly artefactClass = computed(() => this.node().resolvedArtefact?._class);
  protected readonly ViewerFormat = ViewerFormat;
}
