import { Component, inject } from '@angular/core';
import { BaseViewerComponent } from '../base-viewer/base-viewer.component';
import { JsonViewerFormatterService } from '../../services/json-viewer-formatter.service';

@Component({
  selector: 'step-pretty-print-inline',
  templateUrl: './pretty-print-inline.component.html',
  styleUrls: ['./pretty-print-inline.component.scss'],
  standalone: false,
})
export class PrettyPrintInlineComponent extends BaseViewerComponent {
  private _jsonViewerFormatter = inject(JsonViewerFormatterService);

  protected formatValue(json: unknown, maxChars?: number): string {
    const jsonString = this._jsonViewerFormatter.formatToJsonString(json);
    if (maxChars && maxChars < jsonString.length) {
      return `${jsonString.substring(0, maxChars)}...`;
    } else {
      return jsonString.substring(0, jsonString.length - 2);
    }
  }
}
