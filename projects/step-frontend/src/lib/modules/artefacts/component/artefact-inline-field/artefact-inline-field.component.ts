import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import {
  AceMode,
  ArtefactInlineItem,
  ArtefactService,
  DynamicValueBoolean,
  DynamicValueInteger,
  DynamicValueString,
  RichEditorDialogService,
} from '@exense/step-core';

@Component({
  selector: 'step-artefact-inline-field',
  templateUrl: './artefact-inline-field.component.html',
  styleUrl: './artefact-inline-field.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtefactInlineFieldComponent {
  private _richEditorDialog = inject(RichEditorDialogService);
  private _artefactsService = inject(ArtefactService);

  readonly item = input.required<ArtefactInlineItem>();

  protected readonly itemLabel = computed(() => {
    const item = this.item();
    if (!item.isLabelResolved) {
      return '[unresolved]';
    }
    return this._artefactsService.convertDynamicValue(item.label);
  });

  protected readonly itemValue = computed(() => {
    const item = this.item();
    if (!item.isValueResolved) {
      return '[unresolved]';
    }
    return this._artefactsService.convertDynamicValue(item.value);
  });

  protected readonly trackOverflowContent = computed(() => {
    const hasIcon = !!this.item()?.icon;
    const label = this.itemLabel()?.toString() ?? '';
    const value = this.itemValue()?.toString() ?? '';
    return `${hasIcon ? '   ' : ''}${label}:${value}`;
  });

  protected displayValue($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    const label = this.itemLabel()?.toString() ?? '';
    const value = this.itemValue()?.toString() ?? '';
    if (!value) {
      return;
    }
    this._richEditorDialog.editText(value, {
      isReadOnly: true,
      title: label,
      predefinedMode: AceMode.TEXT,
      wrapText: true,
    });
  }
}
