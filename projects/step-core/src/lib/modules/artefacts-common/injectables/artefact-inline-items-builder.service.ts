import { inject, Injectable } from '@angular/core';
import { AbstractArtefact, ReportNode } from '../../../client/step-client-module';
import { AggregatedArtefactInfo, InlineArtefactContext, ReportNodeWithArtefact } from '../types/artefact-types';
import { ArtefactInlineItem } from '../types/artefact-inline-item';
import { ArtefactInlineItemUtilsService } from './artefact-inline-item-utils.service';
import { map, Observable, of } from 'rxjs';

type ArtefactInlineItems = ArtefactInlineItem[] | undefined;
type AggregatedItemsExtractor<A extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<A>> = (
  info?: AggregatedArtefactInfo<A, R>,
) => ArtefactInlineItems;
type AggregatedItemsExtractorAsync<A extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<A>> = (
  info?: AggregatedArtefactInfo<A, R>,
) => Observable<ArtefactInlineItems>;
type ReportNodeItemsExtractor<A extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<A>> = (
  reportNode?: R,
  isResolved?: boolean,
) => ArtefactInlineItems;
type ReportNodeItemsExtractorAsync<A extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<A>> = (
  reportNode?: R,
  isResolved?: boolean,
) => Observable<ArtefactInlineItems>;
type ArtefactItemsExtractor<A extends AbstractArtefact> = (artefact?: A, isResolved?: boolean) => ArtefactInlineItems;
type ArtefactItemsExtractorAsync<A extends AbstractArtefact> = (
  artefact?: A,
  isResolved?: boolean,
) => Observable<ArtefactInlineItems>;

export interface ArtefactInlineItemsBuilder<
  A extends AbstractArtefact,
  R extends ReportNode = ReportNodeWithArtefact<A>,
> {
  extractAggregatedItems(extractor: AggregatedItemsExtractor<A, R>): ArtefactInlineItemsBuilder<A, R>;
  extractReportNodeItems(extractor: ReportNodeItemsExtractor<A, R>): ArtefactInlineItemsBuilder<A, R>;
  extractArtefactItems(extractor: ArtefactItemsExtractor<A>): ArtefactInlineItemsBuilder<A, R>;
  build(context?: InlineArtefactContext<A, R>): ArtefactInlineItems | undefined;
}

export interface ArtefactInlineItemsBuilderAsync<
  A extends AbstractArtefact,
  R extends ReportNode = ReportNodeWithArtefact<A>,
> {
  extractAggregatedItems(extractor: AggregatedItemsExtractor<A, R>): ArtefactInlineItemsBuilderAsync<A, R>;
  extractAggregatedItemsAsync(extractor: AggregatedItemsExtractorAsync<A, R>): ArtefactInlineItemsBuilderAsync<A, R>;
  extractReportNodeItems(extractor: ReportNodeItemsExtractor<A, R>): ArtefactInlineItemsBuilderAsync<A, R>;
  extractReportNodeItemsAsync(extractor: ReportNodeItemsExtractorAsync<A, R>): ArtefactInlineItemsBuilderAsync<A, R>;
  extractArtefactItems(extractor: ArtefactItemsExtractor<A>): ArtefactInlineItemsBuilderAsync<A, R>;
  extractArtefactItemsAsync(extractor: ArtefactItemsExtractorAsync<A>): ArtefactInlineItemsBuilderAsync<A, R>;
  build(context?: InlineArtefactContext<A, R>): Observable<ArtefactInlineItems | undefined>;
}

class ArtefactInlineItemsBuilderBase<B, A extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<A>> {
  constructor(protected readonly _utils: ArtefactInlineItemUtilsService) {}

  protected extractorAggregatedItems?: AggregatedItemsExtractor<A, R>;
  protected extractorReportNodeItems?: ReportNodeItemsExtractor<A, R>;
  protected extractorArtefactItems?: ArtefactItemsExtractor<A>;

  extractAggregatedItems(extractor: AggregatedItemsExtractor<A, R>): B {
    this.extractorAggregatedItems = extractor;
    return this as unknown as B;
  }

  extractReportNodeItems(extractor: ReportNodeItemsExtractor<A, R>): B {
    this.extractorReportNodeItems = extractor;
    return this as unknown as B;
  }

  extractArtefactItems(extractor: ArtefactItemsExtractor<A>): B {
    this.extractorArtefactItems = extractor;
    return this as unknown as B;
  }
}

class ArtefactInlineItemsBuilderImpl<A extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<A>>
  extends ArtefactInlineItemsBuilderBase<ArtefactInlineItemsBuilder<A, R>, A, R>
  implements ArtefactInlineItemsBuilder<A, R>
{
  build(context?: InlineArtefactContext<A, R>): ArtefactInlineItems {
    let result: ArtefactInlineItems = undefined;
    if (context?.aggregatedInfo) {
      result = this.extractAggregated(context?.aggregatedInfo);
    } else if (context?.reportInfo) {
      result = this.extractReportNode(context?.reportInfo);
    }
    return !!result?.length ? result : undefined;
  }

  private extractAggregated(info?: AggregatedArtefactInfo<A, R>): ArtefactInlineItems {
    if (this.extractorAggregatedItems) {
      return this.extractorAggregatedItems(info);
    }

    if (!info?.originalArtefact && !info?.singleInstanceReportNode) {
      return undefined;
    }

    const isResolved = this._utils.isAggregatedArtefactResolved(info);
    if (info?.singleInstanceReportNode) {
      return this.extractReportNode(info.singleInstanceReportNode, isResolved);
    }

    return this.extractArtefact(info.originalArtefact, isResolved);
  }

  private extractReportNode(reportNode?: R, isResolved?: boolean): ArtefactInlineItems {
    if (this.extractorReportNodeItems) {
      return this.extractorReportNodeItems(reportNode);
    }
    if (!reportNode?.resolvedArtefact) {
      return undefined;
    }
    return this.extractArtefact(reportNode.resolvedArtefact as A, isResolved);
  }

  private extractArtefact(artefact?: A, isResolved?: boolean): ArtefactInlineItems {
    if (this.extractorArtefactItems) {
      return this.extractorArtefactItems(artefact, isResolved);
    }
    throw new Error('Artefact extractor not configured');
  }
}

class ArtefactInlineItemsBuilderAsyncImpl<A extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<A>>
  extends ArtefactInlineItemsBuilderBase<ArtefactInlineItemsBuilderAsync<A, R>, A, R>
  implements ArtefactInlineItemsBuilderAsync<A, R>
{
  protected extractorAggregatedItemsAsync?: AggregatedItemsExtractorAsync<A, R>;
  protected extractorReportNodeItemsAsync?: ReportNodeItemsExtractorAsync<A, R>;
  protected extractorArtefactItemsAsync?: ArtefactItemsExtractorAsync<A>;

  extractAggregatedItemsAsync(extractor: AggregatedItemsExtractorAsync<A, R>): this {
    this.extractorAggregatedItemsAsync = extractor;
    return this;
  }

  extractReportNodeItemsAsync(extractor: ReportNodeItemsExtractorAsync<A, R>): this {
    this.extractorReportNodeItemsAsync = extractor;
    return this;
  }

  extractArtefactItemsAsync(extractor: ArtefactItemsExtractorAsync<A>): this {
    this.extractorArtefactItemsAsync = extractor;
    return this;
  }

  build(context?: InlineArtefactContext<A, R>): Observable<ArtefactInlineItems | undefined> {
    let result: Observable<ArtefactInlineItems> = of(undefined);
    if (context?.aggregatedInfo) {
      result = this.extractAggregated(context?.aggregatedInfo);
    } else if (context?.reportInfo) {
      result = this.extractReportNode(context?.reportInfo);
    }
    return result.pipe(map((items) => (!!items?.length ? items : undefined)));
  }

  private extractAggregated(info?: AggregatedArtefactInfo<A, R>): Observable<ArtefactInlineItems> {
    if (this.extractorAggregatedItemsAsync) {
      return this.extractorAggregatedItemsAsync(info);
    }

    if (this.extractorAggregatedItems) {
      return of(this.extractorAggregatedItems(info));
    }

    if (!info?.originalArtefact && !info?.singleInstanceReportNode) {
      return of(undefined);
    }

    const isResolved = this._utils.isAggregatedArtefactResolved(info);
    if (info?.singleInstanceReportNode) {
      return this.extractReportNode(info.singleInstanceReportNode, isResolved);
    }

    return this.extractArtefact(info.originalArtefact, isResolved);
  }

  private extractReportNode(reportNode?: R, isResolved?: boolean): Observable<ArtefactInlineItems> {
    if (this.extractorReportNodeItemsAsync) {
      return this.extractorReportNodeItemsAsync(reportNode);
    }

    if (this.extractorReportNodeItems) {
      return of(this.extractorReportNodeItems(reportNode));
    }

    if (!reportNode?.resolvedArtefact) {
      return of(undefined);
    }
    return this.extractArtefact(reportNode.resolvedArtefact as A, isResolved);
  }

  private extractArtefact(artefact?: A, isResolved?: boolean): Observable<ArtefactInlineItems> {
    if (this.extractorArtefactItemsAsync) {
      return this.extractorArtefactItemsAsync(artefact, isResolved);
    }

    if (this.extractorArtefactItems) {
      return of(this.extractorArtefactItems(artefact, isResolved));
    }
    throw new Error('Artefact extractor not configured');
  }
}

@Injectable({
  providedIn: 'root',
})
export class ArtefactInlineItemsBuilderService {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);

  builder<A extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<A>>(): ArtefactInlineItemsBuilder<
    A,
    R
  > {
    return new ArtefactInlineItemsBuilderImpl(this._artefactInlineItemUtils);
  }

  asyncBuilder<
    A extends AbstractArtefact,
    R extends ReportNode = ReportNodeWithArtefact<A>,
  >(): ArtefactInlineItemsBuilderAsync<A, R> {
    return new ArtefactInlineItemsBuilderAsyncImpl(this._artefactInlineItemUtils);
  }
}
