import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
} from '@exense/step-core';
import { EchoReportNode } from '../../types/echo.report-node';

@Component({
  selector: 'step-echo-report-details',
  templateUrl: './echo-report-details.component.html',
  styleUrl: './echo-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EchoReportDetailsComponent extends BaseReportDetailsComponent<EchoReportNode> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected items = computed(() => {
    const node = this.node();
    const echo = node?.echo;
    const echoExpression = node?.resolvedArtefact?.text?.expression;
    return this._artefactInlineUtils.convert([
      {
        label: 'text',
        value: echo,
        valueExplicitExpression: echoExpression,
        icon: 'log-in',
      },
    ]);
  });
}
