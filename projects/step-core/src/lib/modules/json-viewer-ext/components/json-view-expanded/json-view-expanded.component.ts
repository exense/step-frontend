import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { JsonParserService } from '../../injectables/json-parser.service';
import { DetailedValueComponent } from '../detailed-value/detailed-value.component';
import { MatIconButton } from '@angular/material/button';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-json-view-expanded',
  standalone: true,
  templateUrl: './json-view-expanded.component.html',
  styleUrl: './json-view-expanded.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DetailedValueComponent, MatIconButton, StepBasicsModule],
  host: {
    '(click)': 'toggleCollapse()',
    '[class.collapsable]': 'hasCollapseButton()',
  },
})
export class JsonViewExpandedComponent {
  private _jsonParser = inject(JsonParserService);

  /** @Input() **/
  readonly data = input.required<Record<string, unknown>>();

  /** @Input() **/
  readonly limit = input<number | undefined>(undefined);

  private jsonParsed = computed(() => {
    const data = this.data();
    return this._jsonParser.parse(data);
  });

  protected isCollapsed = signal(true);

  protected hasCollapseButton = computed(() => {
    const jsonParsed = this.jsonParsed();
    const limit = this.limit();
    if (limit === undefined) {
      return false;
    }
    return jsonParsed.length > limit;
  });

  protected items = computed(() => {
    const jsonParsed = this.jsonParsed();
    const limit = this.limit();
    const isCollapsed = this.isCollapsed();
    if (limit === undefined || !isCollapsed) {
      return jsonParsed;
    }
    return jsonParsed.slice(0, limit);
  });

  protected toggleCollapse(): void {
    this.isCollapsed.update((value) => !value);
  }
}
