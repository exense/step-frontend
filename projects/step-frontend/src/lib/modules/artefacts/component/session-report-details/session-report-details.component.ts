import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactFieldValue,
  ArtefactService,
  BaseReportDetailsComponent,
  DynamicValueString,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { SessionArtefact } from '../../types/session.artefact';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'step-session-report-details',
  templateUrl: './session-report-details.component.html',
  styleUrl: './session-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<SessionArtefact>> {
  private _artefactService = inject(ArtefactService);

  protected items = computed(() => {
    let result: Record<string, unknown> | undefined = undefined;
    const token = this.node()?.resolvedArtefact?.token?.value;
    if (!token) {
      return result;
    }
    try {
      const json = JSON.parse(token);
      if (Object.keys(json).length) {
        result = Object.entries(json).reduce(
          (res, [key, value]) => {
            const isDynamic = this._artefactService.isDynamicValue(value as ArtefactFieldValue);
            res[key] = isDynamic ? this._artefactService.convertDynamicValue(value as DynamicValueString) : value;
            return res;
          },
          {} as Record<string, unknown>,
        );
      }
    } catch (e) {}
    return result;
  });

  protected copyItems(): void {
    this.copyToClipboard(this.node()?.resolvedArtefact?.token?.value);
  }
}
