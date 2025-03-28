import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  BaseReportDetailsComponent,
  DynamicValueString,
  DynamicValuesUtilsService,
  JsonParserIconDictionaryConfig,
  ReportNodeWithArtefact,
  SimpleOrDynamicValue,
} from '@exense/step-core';
import { ReturnArtefact } from '../../types/return.artefact';

@Component({
  selector: 'step-return-report-details',
  templateUrl: './return-report-details.component.html',
  styleUrl: './return-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<ReturnArtefact>> {
  private _dynamicValueUtils = inject(DynamicValuesUtilsService);

  protected outputItems = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    let result: Record<string, unknown> | undefined = undefined;
    if (!artefact?.output?.value) {
      return result;
    }
    try {
      const json = JSON.parse(artefact.output.value);
      if (Object.keys(json).length) {
        result = Object.entries(json).reduce(
          (res, [key, value]) => {
            const isDynamic = this._dynamicValueUtils.isDynamicValue(value as SimpleOrDynamicValue);
            res[key] = isDynamic
              ? this._dynamicValueUtils.convertDynamicValueToSimpleValue(value as DynamicValueString)
              : value;
            return res;
          },
          {} as Record<string, unknown>,
        );
      }
    } catch (e) {}
    return result;
  });

  protected readonly itemIcons: JsonParserIconDictionaryConfig = [
    { key: '*', icon: 'log-out', tooltip: 'Output', levels: 0 },
  ];

  protected copyOutput(): void {
    this.copyToClipboard(this.node()?.resolvedArtefact?.output?.value);
  }
}
