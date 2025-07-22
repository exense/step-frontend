import { Component, computed, inject, signal } from '@angular/core';
import { CustomComponent } from '../../custom-registeries/custom-registries.module';
import { ArtefactInlineItem } from '../types/artefact-inline-item';
import { AggregatedArtefactInfo, InlineArtefactContext, ReportNodeWithArtefact } from '../types/artefact-types';
import { Observable, of } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import {
  AbstractArtefact,
  DynamicValueBoolean,
  DynamicValueInteger,
  DynamicValueString,
  ReportNode,
} from '../../../client/step-client-module';
import { DynamicValuesUtilsService } from '../../basics/step-basics.module';

@Component({
  template: '',
  standalone: false,
})
export abstract class BaseInlineArtefactLegacyComponent<
  A extends AbstractArtefact,
  R extends ReportNode = ReportNodeWithArtefact<A>,
> implements CustomComponent
{
  private _dynamicValueUtils = inject(DynamicValuesUtilsService);

  private contextInternal = signal<InlineArtefactContext<A, R> | undefined>(undefined);
  protected info = computed(() => this.contextInternal()?.aggregatedInfo);
  protected isVertical = computed(() => !!this.contextInternal()?.isVertical);

  protected readonly currentContext = this.contextInternal.asReadonly();
  protected context$ = toObservable(this.contextInternal);
  private aggregatedInfoItems$ = this.context$.pipe(
    switchMap((context) => {
      if (!context?.aggregatedInfo) {
        return of(undefined);
      }
      const isResolved = this.isResolved(context?.aggregatedInfo);
      if (context?.aggregatedInfo?.singleInstanceReportNode) {
        const items = this.getReportNodeItems(context?.aggregatedInfo?.singleInstanceReportNode, context?.isVertical);
        return of(items);
      }
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

  context?: InlineArtefactContext<A, R>;

  contextChange(previousContext?: InlineArtefactContext<A, R>, currentContext?: InlineArtefactContext<A, R>) {
    this.contextInternal.set(currentContext);
  }

  protected abstract getItems(
    artefact?: A,
    isVertical?: boolean,
    isResolved?: boolean,
  ): ArtefactInlineItem[] | undefined;

  protected getReportNodeItems(info?: R, isVertical?: boolean): ArtefactInlineItem[] | undefined {
    const artefact = info?.resolvedArtefact as A;
    if (!artefact) {
      return undefined;
    }
    return this.getItems(artefact, isVertical, true);
  }

  protected getArtefactItems(
    info?: AggregatedArtefactInfo<A, R>,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[] | undefined> {
    const artefact = info?.originalArtefact;
    if (!artefact) {
      return of(undefined);
    }
    return of(this.getItems(artefact, isVertical, isResolved));
  }

  protected isResolved(info?: AggregatedArtefactInfo<A, R>): boolean {
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
      const isDynamic = this._dynamicValueUtils.isDynamicValue(value);
      if (isDynamic) {
        return {
          label: { value: label, dynamic: false },
          value: value as DynamicValueString | DynamicValueInteger | DynamicValueBoolean,
          isLabelResolved: true,
          isValueResolved: isResolved,
        };
      }

      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }

      return {
        label: { value: label, dynamic: false },
        value: {
          value: value as string | number | boolean,
          dynamic: false,
        },
        isLabelResolved: true,
        isValueResolved: true,
      };
    });
  }
}
