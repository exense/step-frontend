import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseReportDetailsComponent } from '@exense/step-core';
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
  protected items = computed(() => {
    const echo = this.node()?.echo;
    if (!echo) {
      return undefined;
    }
    return {
      '': echo,
    } as Record<string, unknown>;
  });
}
