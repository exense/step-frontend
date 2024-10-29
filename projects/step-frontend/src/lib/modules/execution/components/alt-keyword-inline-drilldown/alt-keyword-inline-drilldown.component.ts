import { Component, computed, inject, input } from '@angular/core';
import { ArtefactInlineItem, AugmentedControllerService, ReportNode, ReportNodeExt } from '@exense/step-core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'step-alt-keyword-inline-drilldown',
  templateUrl: './alt-keyword-inline-drilldown.component.html',
  styleUrl: './alt-keyword-inline-drilldown.component.scss',
})
export class AltKeywordInlineDrilldownComponent {
  private _controllerService = inject(AugmentedControllerService);

  readonly node = input.required<ReportNodeExt>();

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

  protected inputParams = computed(() => {
    const artefactClass = this.artefactClass();
    const input = this.node().input;
    let keywordInput: Record<string, string> | undefined = undefined;
    if (artefactClass !== 'CallKeyword' || !input) {
      return undefined;
    }
    try {
      keywordInput = JSON.parse(input) as Record<string, string>;
    } catch {
      keywordInput = undefined;
    }
    if (!keywordInput) {
      return undefined;
    }
    return Object.entries(keywordInput).reduce(
      (res, [key, value]) =>
        res.concat({
          label: key,
          isResolved: true,
          value: {
            value,
            dynamic: false,
          },
        }),
      [] as ArtefactInlineItem[],
    );
  });

  protected outputParams = computed(() => {
    const artefactClass = this.artefactClass();
    const output = this.node().output;
    let keywordInput: Record<string, string> | undefined = undefined;
    if (artefactClass !== 'CallKeyword' || !output) {
      return undefined;
    }
    try {
      keywordInput = JSON.parse(output) as Record<string, string>;
    } catch {
      keywordInput = undefined;
    }
    if (!keywordInput) {
      return undefined;
    }
    return Object.entries(keywordInput).reduce(
      (res, [key, value]) =>
        res.concat({
          label: key,
          isResolved: true,
          value: {
            value,
            dynamic: false,
          },
        }),
      [] as ArtefactInlineItem[],
    );
  });

  protected echoParams = computed(() => {
    const artefactClass = this.artefactClass();
    const echo = this.node().echo;
    if (artefactClass !== 'Echo' || !echo) {
      return undefined;
    }
    return [
      {
        label: 'Text',
        isResolved: true,
        value: {
          value: echo,
          dynamic: false,
        },
      },
    ] as ArtefactInlineItem[];
  });

  protected setParams = computed(() => {
    const artefactClass = this.artefactClass();
    const { key, value } = this.node();
    if (artefactClass !== 'Set') {
      return undefined;
    }
    return [
      {
        label: 'Key',
        isResolved: true,
        value: {
          value: key,
          dynamic: false,
        },
      },
      {
        label: 'Value',
        isResolved: true,
        value: {
          value,
          dynamic: false,
        },
      },
    ] as ArtefactInlineItem[];
  });
}
