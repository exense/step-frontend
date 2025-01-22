import { Component, computed, inject, input } from '@angular/core';
import { AugmentedControllerService, ReportNode } from '@exense/step-core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, shareReplay, switchMap, tap } from 'rxjs';

@Component({
  selector: 'step-alt-report-node-details',
  templateUrl: './alt-report-node-details.component.html',
  styleUrl: './alt-report-node-details.component.scss',
})
export class AltReportNodeDetailsComponent<R extends ReportNode = ReportNode> {
  private _controllerService = inject(AugmentedControllerService);

  readonly node = input.required<R>();
  readonly showArtefact = input(false);

  private children$ = toObservable(this.node).pipe(
    switchMap((node) => {
      if (node.status !== 'FAILED') {
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
  );

  protected readonly children = toSignal(this.children$, { initialValue: [] });
  protected readonly artefactClass = computed(() => this.node().resolvedArtefact?._class);
}
