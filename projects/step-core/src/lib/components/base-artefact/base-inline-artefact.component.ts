import { Component, computed, signal } from '@angular/core';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { ArtefactInlineItem } from './artefact-inline-item';
import { AggregatedArtefactInfo } from '../../shared';
import { Observable, of } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import {
  AbstractArtefact,
  DynamicValueBoolean,
  DynamicValueInteger,
  DynamicValueString,
  ReportNode,
} from '../../client/step-client-module';

export interface InlineArtefactContext<A extends AbstractArtefact, R extends ReportNode = ReportNode> {
  aggregatedInfo?: AggregatedArtefactInfo<A>;
  reportInfo?: R;
  isVertical?: boolean;
}

@Component({
  template: '',
})
export abstract class BaseInlineArtefactComponent<A extends AbstractArtefact, R extends ReportNode = ReportNode>
  implements CustomComponent
{
  private contextInternal = signal<InlineArtefactContext<A, R> | undefined>(undefined);
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
    if (!reportInfo || !this.getReportNodeItems) {
      return undefined;
    }
    return this.getReportNodeItems(reportInfo, isVertical);
  });

  protected items = computed(() => {
    const aggregated = this.aggregatedInfoItems();
    const report = this.reportInfoItems();
    return aggregated ?? report;
  });

  context?: InlineArtefactContext<A, R>;

  contextChange(previousContext?: InlineArtefactContext<A, R>, currentContext?: InlineArtefactContext<A, R>) {
    this.contextInternal.set(currentContext);
  }

  protected abstract getReportNodeItems?(info?: R, isVertical?: boolean): ArtefactInlineItem[] | undefined;

  protected abstract getArtefactItems(
    info?: AggregatedArtefactInfo<A>,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[] | undefined>;

  private isResolved(info?: AggregatedArtefactInfo<A>): boolean {
    if (!info) {
      return false;
    }

    const statuses = new Set(Object.keys(info.countByStatus ?? {}));
    if (statuses.has('RUNNING')) {
      return false;
    }

    return true;
  }

  protected convert(
    items: [
      string,
      string | number | boolean | DynamicValueString | DynamicValueInteger | DynamicValueBoolean | undefined,
    ][],
    isResolved?: boolean,
  ): ArtefactInlineItem[] {
    return items.map(([label, value]) => {
      const valueType = typeof value;
      if (valueType === 'string' || valueType === 'number' || valueType === 'boolean' || valueType === 'undefined') {
        return {
          label,
          value: {
            value: value as string | number | boolean,
            dynamic: false,
          },
          isResolved: true,
        };
      }
      return {
        label,
        value: value as DynamicValueString | DynamicValueInteger | DynamicValueBoolean,
        isResolved,
      };
    });
  }
}
