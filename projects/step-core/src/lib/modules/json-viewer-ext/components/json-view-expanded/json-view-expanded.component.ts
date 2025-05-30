import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { JsonParserService } from '../../injectables/json-parser.service';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { JsonParserIconDictionaryConfig } from '../../types/json-parser-icon-dictionary';
import { AceMode, RichEditorDialogService } from '../../../rich-editor';
import { JsonNode } from '../../types/json-node';

@Component({
  selector: 'step-json-view-expanded',
  standalone: true,
  templateUrl: './json-view-expanded.component.html',
  styleUrl: './json-view-expanded.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepBasicsModule],
  host: {
    '[class.collapsable]': 'hasCollapseButton()',
  },
})
export class JsonViewExpandedComponent {
  private _jsonParser = inject(JsonParserService);
  private _richEditorDialog = inject(RichEditorDialogService);

  /** @Input() **/
  readonly data = input.required<Record<string, unknown>>();

  /** @Input() **/
  readonly iconsDictionary = input<JsonParserIconDictionaryConfig | undefined>(undefined);

  /** @Input() **/
  readonly limit = input<number | undefined>(undefined);

  /** @Input() **/
  readonly labelExpand = input('Expand');

  /** @Input() **/
  readonly labelCollapse = input('Collapse');

  private jsonParsed = computed(() => {
    const iconsDictionary = this.iconsDictionary();
    const data = this.data();
    return this._jsonParser.parse(data, iconsDictionary);
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

  protected displayNode(node: JsonNode): void {
    if (!node.value) {
      return;
    }
    const text = node.value.toString();
    this._richEditorDialog.editText(text, {
      isReadOnly: true,
      title: node.name,
      predefinedMode: AceMode.TEXT,
      wrapText: true,
    });
  }
}
