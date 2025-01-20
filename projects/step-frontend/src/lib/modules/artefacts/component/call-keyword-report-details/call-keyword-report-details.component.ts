import { Component, computed, inject, signal } from '@angular/core';
import { CustomComponent, JsonViewerFormatterService } from '@exense/step-core';
import { KeywordReportNode } from '../../types/keyword.report-node';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'step-call-keyword-report-details',
  templateUrl: './call-keyword-report-details.component.html',
  styleUrl: './call-keyword-report-details.component.scss',
})
export class CallKeywordReportDetailsComponent implements CustomComponent {
  private _formatter = inject(JsonViewerFormatterService);
  private _clipboard = inject(DOCUMENT).defaultView!.navigator.clipboard;

  private contextInternal = signal<KeywordReportNode | undefined>(undefined);

  protected keywordInputs = computed(() => {
    const context = this.contextInternal();
    let result: Record<string, unknown> | undefined = undefined;
    if (!context?.input) {
      return result;
    }
    try {
      result = JSON.parse(context.input);
    } catch (e) {}
    return result;
  });

  protected keywordOutputs = computed(() => {
    const context = this.contextInternal();
    let result: Record<string, unknown> | undefined = undefined;
    if (!context?.output) {
      return result;
    }
    try {
      result = JSON.parse(context.output);
    } catch (e) {}
    return result;
  });

  protected isInputsExpanded = signal(false);
  protected isOutputsExpanded = signal(false);

  protected toggleInputsExpanded(): void {
    this.isInputsExpanded.update((value) => !value);
  }

  protected toggleOutputsExpanded(): void {
    this.isOutputsExpanded.update((value) => !value);
  }

  protected copyInput(): void {
    this.copyToClipboard(this.contextInternal()?.input);
  }

  protected copyOutput(): void {
    this.copyToClipboard(this.contextInternal()?.output);
  }

  contextChange(previousContext?: KeywordReportNode, currentContext?: KeywordReportNode) {
    this.contextInternal.set(currentContext);
  }

  private copyToClipboard(json?: string): void {
    if (!json) {
      return;
    }
    const formatted = this._formatter.formatToJsonString(json);
    this._clipboard.writeText(formatted);
  }
}
