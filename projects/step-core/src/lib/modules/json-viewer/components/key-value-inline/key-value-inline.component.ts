import { Component, inject, ViewEncapsulation } from '@angular/core';
import { JsonViewerFormatterService } from '../../services/json-viewer-formatter.service';
import { BaseViewerComponent } from '../base-viewer/base-viewer.component';

@Component({
  selector: 'step-key-value-inline',
  templateUrl: './key-value-inline.component.html',
  styleUrls: ['./key-value-inline.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class KeyValueInlineComponent extends BaseViewerComponent {
  private _jsonViewerFormatter = inject(JsonViewerFormatterService);

  protected formatValue(json: unknown, maxChars?: number): string {
    const keyValue = this._jsonViewerFormatter.formatToKeyValue(json, true);
    const inlineString = keyValue.reduce((res, { key, value }) => `${res}${key} = ${value}  ¦ `, '');

    if (maxChars && maxChars < inlineString.length) {
      return `${inlineString.substring(0, maxChars)}...`;
    } else {
      return inlineString.substring(0, inlineString.length - 2);
    }
  }
}
