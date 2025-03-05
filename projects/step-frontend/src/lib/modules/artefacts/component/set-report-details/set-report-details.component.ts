import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseReportDetailsComponent, JsonParserIconDictionaryConfig } from '@exense/step-core';
import { SetReportNode } from '../../types/set.report-node';

@Component({
  selector: 'step-set-report-details',
  templateUrl: './set-report-details.component.html',
  styleUrl: './set-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetReportDetailsComponent extends BaseReportDetailsComponent<SetReportNode> {
  protected readonly items = computed(() => {
    const node = this.node();
    let result: Record<string, unknown> | undefined = undefined;
    if (!node) {
      return result;
    }
    const { key, value } = node;
    result = { key, value };
    return result;
  });

  protected readonly icons: JsonParserIconDictionaryConfig = [{ key: '*', icon: 'log-in', levels: 0 }];
}
