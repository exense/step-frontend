import { Component, computed, signal } from '@angular/core';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { ArtefactInlineItem } from './artefact-inline-item';
import { AggregatedArtefactInfo } from '../../shared';
import { Observable, of } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ReportNodeExt } from '../../client/step-client-module';

export interface InlineArtefactContext<A extends AggregatedArtefactInfo> {
  aggregatedInfo?: A;
  reportInfo?: ReportNodeExt;
  isVertical?: boolean;
}

@Component({
  template: '',
})
export abstract class BaseInlineArtefactComponent<A extends AggregatedArtefactInfo> implements CustomComponent {
  private contextInternal = signal<InlineArtefactContext<A> | undefined>(undefined);
  protected info = computed(() => this.contextInternal()?.aggregatedInfo);
  protected isVertical = computed(() => !!this.contextInternal()?.isVertical);

  private context$ = toObservable(this.contextInternal);
  private aggregatedInfoItems$ = this.context$.pipe(
    switchMap((context) => {
      if (!context?.aggregatedInfo) {
        return of(undefined);
      }
      const isResolved = this.isResolved(context?.aggregatedInfo);
      return this.getArtefactItems(context?.aggregatedInfo, context?.isVertical, isResolved);
    }),
    takeUntilDestroyed(),
  );
  private aggregatedInfoItems = toSignal(this.aggregatedInfoItems$);

  private reportInfoItems = computed(() => {
    const ctx = this.contextInternal();
    const reportInfo = ctx?.reportInfo;
    const isVertical = ctx?.isVertical;
    if (!reportInfo) {
      return undefined;
    }
    return this.getReportNodeItems(reportInfo, isVertical);
  });

  protected items = computed(() => {
    const aggregated = this.aggregatedInfoItems();
    const report = this.reportInfoItems();
    return aggregated ?? report;
  });

  context?: InlineArtefactContext<A>;

  contextChange(previousContext?: InlineArtefactContext<A>, currentContext?: InlineArtefactContext<A>) {
    this.contextInternal.set(currentContext);
  }

  protected abstract getReportNodeItems(info?: ReportNodeExt, isVertical?: boolean): ArtefactInlineItem[] | undefined;

  protected abstract getArtefactItems(
    info?: A,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[] | undefined>;

  private isResolved(info?: A): boolean {
    if (!info) {
      return false;
    }

    const statuses = new Set(Object.keys(info.countByStatus ?? {}));
    if (statuses.has('RUNNING')) {
      return false;
    }

    return true;
  }
}
