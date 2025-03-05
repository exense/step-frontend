import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import {
  ArtefactInlineItem,
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { EchoArtefact } from '../../types/echo.artefact';
import { EchoReportNode } from '../../types/echo.report-node';

@Component({
  selector: 'step-echo-inline',
  templateUrl: './echo-inline.component.html',
  styleUrl: './echo-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class EchoInlineComponent extends BaseInlineArtefactComponent<EchoArtefact, EchoReportNode> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<EchoArtefact, EchoReportNode>()
    .extractReportNodeItems((reportNode, isResolved) => this.getReportNodeItems(reportNode, isResolved))
    .extractArtefactItems((artefact, isResolved) => this.getArtefactItems(artefact, isResolved));

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));

  private getReportNodeItems(reportNode?: EchoReportNode, isResolved?: boolean): ArtefactInlineItem[] | undefined {
    const echo = reportNode?.echo;
    if (!echo) {
      return undefined;
    }
    return this._artefactInlineUtils.convert([[undefined, echo]], isResolved);
  }

  private getArtefactItems(echo?: EchoArtefact, isResolved: boolean = false): ArtefactInlineItem[] | undefined {
    if (!echo) {
      return undefined;
    }
    return this._artefactInlineUtils.convert([[undefined, echo.text]], isResolved);
  }
}
