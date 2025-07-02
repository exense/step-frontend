import { Component, inject, TrackByFunction, ViewEncapsulation } from '@angular/core';
import { BaseViewerComponent } from '../base-viewer/base-viewer.component';
import { KeyValue } from '@angular/common';
import { JsonViewerFormatterService } from '../../services/json-viewer-formatter.service';

@Component({
  selector: 'step-key-value',
  templateUrl: './key-value.component.html',
  styleUrls: ['./key-value.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class KeyValueComponent extends BaseViewerComponent<KeyValue<string, string>[]> {
  private _jsonViewerFormatter = inject(JsonViewerFormatterService);

  readonly trackByKeyValue: TrackByFunction<KeyValue<string, string>> = (index, item) => item.key;

  protected formatValue(json: unknown, maxChars: number | undefined): KeyValue<string, string>[] {
    return this._jsonViewerFormatter.formatToKeyValue(json);
  }
}
