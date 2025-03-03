import { inject, Injectable } from '@angular/core';
import { AbstractArtefact, ReportNode } from '../../../client/step-client-module';
import { AggregatedArtefactInfo, InlineArtefactContext, ReportNodeWithArtefact } from '../types/artefact-types';
import { ArtefactInlineItem } from '../types/artefact-inline-item';
import { ArtefactInlineItemUtilsService } from './artefact-inline-item-utils.service';

type ArtefactInlineItems = ArtefactInlineItem[] | undefined;

export interface ArtefactInlineItemsBuilder<
  A extends AbstractArtefact,
  R extends ReportNode = ReportNodeWithArtefact<A>,
> {
  extractAggregatedItems(extractor: (info?: AggregatedArtefactInfo<A, R>) => ArtefactInlineItems): this;
  extractReportNodeItems(extractor: (artefact?: R, isResolved?: boolean) => ArtefactInlineItems): this;
  extractArtefactItems(extractor: (artefact?: A, isResolved?: boolean) => ArtefactInlineItems): this;
  build(context?: InlineArtefactContext<A, R>): ArtefactInlineItems;
}

class ArtefactInlineItemsBuilderImpl<A extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<A>>
  implements ArtefactInlineItemsBuilder<A, R>
{
  constructor(private readonly _utils: ArtefactInlineItemUtilsService) {}

  private extractorAggregatedItems?: (info?: AggregatedArtefactInfo<A, R>) => ArtefactInlineItems;
  private extractorReportNodeItems?: (reportNode?: R, isResolved?: boolean) => ArtefactInlineItems;
  private extractorArtefactItems?: (artefact?: A, isResolved?: boolean) => ArtefactInlineItems;

  extractAggregatedItems(extractor: (info?: AggregatedArtefactInfo<A, R>) => ArtefactInlineItems): this {
    this.extractorAggregatedItems = extractor;
    return this;
  }

  extractReportNodeItems(extractor: (artefact?: R, isResolved?: boolean) => ArtefactInlineItems): this {
    this.extractorReportNodeItems = extractor;
    return this;
  }

  extractArtefactItems(extractor: (artefact?: A, isResolved?: boolean) => ArtefactInlineItems): this {
    this.extractorArtefactItems = extractor;
    return this;
  }

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
}
