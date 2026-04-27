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
import { SessionArtefact } from '../../types/session.artefact';

@Component({
  selector: 'step-session-report-details',
  templateUrl: './session-report-details.component.html',
  styleUrl: './session-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SessionReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<SessionArtefact>> {
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
    const token = this.node()?.resolvedArtefact?.token?.value;
    if (!token) {
      return undefined;
    }
    try {
      const json = JSON.parse(token);
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

  protected copyItems(): void {
    this.copyToClipboard(this.node()?.resolvedArtefact?.token?.value);
  }
}
