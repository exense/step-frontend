import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { JsonParserService } from '../../injectables/json-parser.service';
import { DetailedValueComponent } from '../detailed-value/detailed-value.component';

@Component({
  selector: 'step-json-view-expanded',
  standalone: true,
  templateUrl: './json-view-expanded.component.html',
  styleUrl: './json-view-expanded.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DetailedValueComponent],
})
export class JsonViewExpandedComponent {
  private _jsonParser = inject(JsonParserService);

  /** @Input() **/
  readonly data = input.required<Record<string, unknown>>();

  protected jsonParsed = computed(() => {
    const data = this.data();
    return this._jsonParser.parse(data);
  });
}
