import { Component, computed, inject } from '@angular/core';
import {
  ArtefactService,
  BaseReportDetailsComponent,
  JsonParserIconDictionaryConfig,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { CallPlanArtefact } from '../../types/call-plan.artefact';

@Component({
  selector: 'step-call-plan-report-details',
  templateUrl: './call-plan-report-details.component.html',
  styleUrl: './call-plan-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
})
export class CallPlanReportDetailsComponent extends BaseReportDetailsComponent<
  ReportNodeWithArtefact<CallPlanArtefact>
> {
  private _artefactsService = inject(ArtefactService);
  private artefact = computed(() => this.node()?.resolvedArtefact);

  protected readonly searchCriteria = computed(() => {
    const artefact = this.artefact();
    let result: Record<string, unknown> | undefined = undefined;
    if (!artefact?.selectionAttributes?.value) {
      return result;
    }
    try {
      const json = JSON.parse(artefact.selectionAttributes.value);
      if (Object.keys(json).length) {
        result = json;
      }
    } catch (e) {}
    return result;
  });

  protected readonly inputs = computed(() => {
    const artefact = this.artefact();
    let result: Record<string, unknown> | undefined = undefined;
    if (!artefact?.input?.value) {
      return result;
    }
    try {
      const json = JSON.parse(artefact.input.value);
      if (Object.keys(json).length) {
        Object.keys(json).forEach((key) => {
          if (this._artefactsService.isDynamicValue(json[key])) {
            json[key] = this._artefactsService.convertDynamicValue(json[key]);
          }
        });
        result = json;
      }
    } catch (e) {}
    return result;
  });

  protected readonly searchCriteriaIcons: JsonParserIconDictionaryConfig = [
    { key: '*', icon: 'search', tooltip: 'Search criteria', levels: 0 },
  ];

  protected readonly inputIcons: JsonParserIconDictionaryConfig = [
    { key: '*', icon: 'log-in', tooltip: 'Input', levels: 0 },
  ];

  protected copySearchCriteria(): void {
    this.copyToClipboard(this.artefact()?.selectionAttributes?.value);
  }

  protected copyInputs(): void {
    this.copyToClipboard(this.artefact()?.input?.value);
  }
}
