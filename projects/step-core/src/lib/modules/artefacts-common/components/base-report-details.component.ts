import { Component, inject, signal } from '@angular/core';
import { ReportNode } from '../../../client/step-client-module';
import { CustomComponent } from '../../custom-registeries/custom-registries.module';
import { JsonViewerFormatterService } from '../../json-viewer/services/json-viewer-formatter.service';
import { DOCUMENT } from '@angular/common';

@Component({
  template: '',
  standalone: false,
})
export abstract class BaseReportDetailsComponent<R extends ReportNode> implements CustomComponent {
  protected _formatter = inject(JsonViewerFormatterService);
  protected _clipboard = inject(DOCUMENT).defaultView?.navigator?.clipboard;

  private contextInternal = signal<R | undefined>(undefined);

  protected node = this.contextInternal.asReadonly();

  contextChange(previousContext?: R, currentContext?: R) {
    this.contextInternal.set(currentContext);
  }

  protected copyToClipboard(json?: string): void {
    if (!json) {
      return;
    }
    const formatted = this._formatter.formatToJsonString(json);
    this._clipboard?.writeText?.(formatted);
  }
}
