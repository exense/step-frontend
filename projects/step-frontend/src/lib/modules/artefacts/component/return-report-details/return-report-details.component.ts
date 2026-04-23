import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  DynamicValueString,
  DynamicValuesUtilsService,
  ItemType,
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
  standalone: false,
})
export class ReturnReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<ReturnArtefact>> {
  private _dynamicValueUtils = inject(DynamicValuesUtilsService);
  private _artefactInlineItems = inject(ArtefactInlineItemUtilsService);

  private normalizeInlineValue(value: unknown): string | number | boolean | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    return JSON.stringify(value);
  }

  protected readonly outputItems = computed(() => {
    const output = this.node()?.resolvedArtefact?.output?.value;
    if (!output) {
      return undefined;
    }
    try {
      const json = JSON.parse(output);
      if (Object.keys(json).length) {
        return this._artefactInlineItems.convert(
          Object.entries(json).map(([key, value]) => {
            const isDynamic = this._dynamicValueUtils.isDynamicValue(value as SimpleOrDynamicValue);
            const preparedValue = isDynamic
              ? this._dynamicValueUtils.convertDynamicValueToSimpleValue(value as DynamicValueString)
              : value;
            return { label: key, value: this.normalizeInlineValue(preparedValue), itemType: ItemType.RESULT };
          }),
        );
      }
    } catch (e) {}
    return undefined;
  });

  protected copyOutput(): void {
    this.copyToClipboard(this.node()?.resolvedArtefact?.output?.value);
  }
}
