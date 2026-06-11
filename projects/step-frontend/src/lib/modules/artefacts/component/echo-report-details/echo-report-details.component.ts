import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArtefactInlineItemUtilsService, BaseReportDetailsComponent, ItemType } from '@exense/step-core';
import { EchoReportNode } from '../../types/echo.report-node';

@Component({
  selector: 'step-echo-report-details',
  templateUrl: './echo-report-details.component.html',
  styleUrl: './echo-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EchoReportDetailsComponent extends BaseReportDetailsComponent<EchoReportNode> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    const echo = node?.echo;
    const echoExpression = node?.resolvedArtefact?.text?.expression;
    return this._artefactInlineUtils.convert([
      { label: 'text', value: echo, valueExplicitExpression: echoExpression, itemType: ItemType.CONFIGURATION },
    ]);
  });
}
