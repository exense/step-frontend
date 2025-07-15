import { Component, inject, ViewEncapsulation } from '@angular/core';
import { BaseViewerComponent } from '../base-viewer/base-viewer.component';
import { JsonViewerFormatterService } from '../../services/json-viewer-formatter.service';

@Component({
  selector: 'step-pretty-print',
  templateUrl: './pretty-print.component.html',
  styleUrls: ['./pretty-print.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class PrettyPrintComponent extends BaseViewerComponent {
  private _jsonViewerFormatter = inject(JsonViewerFormatterService);

  protected formatValue(json: unknown, maxChars?: number): string {
    return this._jsonViewerFormatter.formatToJsonString(json);
  }
}
