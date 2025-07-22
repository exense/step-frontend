import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  JsonParserIconDictionaryConfig,
} from '@exense/step-core';
import { SetReportNode } from '../../types/set.report-node';

@Component({
  selector: 'step-set-report-details',
  templateUrl: './set-report-details.component.html',
  styleUrl: './set-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SetReportDetailsComponent extends BaseReportDetailsComponent<SetReportNode> {
  private _artefactInlineService = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    if (!node) {
      return undefined;
    }

    const { key, value } = node;
    return this._artefactInlineService.convert([
      ['key', key, 'log-in'],
      ['value', value, 'log-in'],
    ]);
  });
}
