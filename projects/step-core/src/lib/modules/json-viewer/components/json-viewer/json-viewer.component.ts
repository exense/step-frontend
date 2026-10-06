import { Component, inject, Input, OnChanges, SimpleChanges, ViewEncapsulation, DOCUMENT } from '@angular/core';
import { ViewerFormat } from '../../shared/viewer-format.enum';
import { JsonViewerFormatterService } from '../../services/json-viewer-formatter.service';

@Component({
  selector: 'step-json-viewer',
  templateUrl: './json-viewer.component.html',
  styleUrls: ['./json-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class JsonViewerComponent implements OnChanges {
  private _formatter = inject(JsonViewerFormatterService);
  private _clipboard = inject(DOCUMENT).defaultView!.navigator.clipboard;

  /* eslint-disable @angular-eslint/prefer-signals -- Keep the existing mutable input API, including the toolbox's two-way format binding. */
  @Input() json?: unknown;
  @Input() format: ViewerFormat = ViewerFormat.JSON;
  /* eslint-enable @angular-eslint/prefer-signals */

  protected readonly ViewFormat = ViewerFormat;

  protected isExtendedView = false;
  protected hasContent = false;

  ngOnChanges(changes: SimpleChanges): void {
    const cJson = changes['json'];
    if (cJson?.previousValue !== cJson?.currentValue || cJson?.firstChange) {
      this.determineContentExistence(cJson?.currentValue);
    }
  }

  protected toggleExtended(): void {
    this.isExtendedView = !this.isExtendedView;
  }

  protected copyToClipboard(): void {
    const valueToCopy = this.getFormattedString();
    this._clipboard.writeText(valueToCopy);
  }

  private determineContentExistence(json?: unknown): void {
    const jsonObject = typeof json === 'string' ? JSON.parse(json) : json;
    this.hasContent = jsonObject && Object.keys(jsonObject).length > 0;
  }

  private getFormattedString(): string {
    if (this.format === ViewerFormat.JSON) {
      return this._formatter.formatToJsonString(this.json);
    }

    const keyValues = this._formatter.formatToKeyValue(this.json);
    return keyValues.reduce((res, { key, value }) => res + `${key} = ${value}\n`, ``);
  }
}
