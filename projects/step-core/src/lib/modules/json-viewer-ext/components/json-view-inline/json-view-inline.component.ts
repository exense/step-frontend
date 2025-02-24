import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { JsonParserService } from '../../injectables/json-parser.service';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'step-json-view-inline',
  standalone: true,
  imports: [SlicePipe],
  templateUrl: './json-view-inline.component.html',
  styleUrl: './json-view-inline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonViewInlineComponent {
  private _jsonParser = inject(JsonParserService);

  /** @Input() **/
  readonly data = input.required<Record<string, unknown>>();

  protected jsonParsed = computed(() => {
    const data = this.data();
    return this._jsonParser.parse(data);
  });
}
