import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { AceMode, RichEditorDialogService } from '../../../rich-editor';
import { ArtefactInlineItem } from '../../types/artefact-inline-item';
import { PopoverMode, StepBasicsModule } from '../../../basics/step-basics.module';

const DEFAULT_MARGIN = '0.5rem';

@Component({
  selector: 'step-artefact-inline-field',
  templateUrl: './artefact-inline-field.component.html',
  styleUrl: './artefact-inline-field.component.scss',
  imports: [StepBasicsModule],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'highlight-inline-item',
    '[style.--style__margin]': 'margin()',
  },
})
export class ArtefactInlineFieldComponent {
  private _richEditorDialog = inject(RichEditorDialogService);

  readonly item = input.required<ArtefactInlineItem>();

  private label = computed(() => this.item()?.label);
  private value = computed(() => this.item()?.value);

  protected readonly icon = computed(() => this.item()?.icon);
  protected readonly iconTooltip = computed(() => this.item()?.iconTooltip ?? '');

  protected readonly prefix = computed(() => this.item()?.prefix);
  protected readonly suffix = computed(() => this.item()?.suffix);

  protected readonly hasLabel = computed(() => !!this.item().label);
  protected readonly hasValue = computed(() => !!this.item().value);

  protected readonly labelExpression = computed(() => this.label()?.expression);
  protected readonly valueExpression = computed(() => this.value()?.expression);

  protected readonly isLabelResolved = computed(() => !!this.label()?.isResolved);
  protected readonly isValueResolved = computed(() => !!this.value()?.isResolved);

  protected readonly margin = computed(() => this.item()?.margin ?? DEFAULT_MARGIN);

  // todo remove
  protected readonly labelTooltip = computed(() => this.label()?.tooltip ?? '');

  // todo remove
  protected readonly valueTooltip = computed(() => this.value()?.tooltip ?? '');

  protected readonly isValueFirst = computed(() => this.item()?.isValueFirst ?? false);
  protected readonly showColon = computed(() => {
    const isValueFirst = this.isValueFirst();
    const hideColon = this.item()?.hideColon ?? false;
    return !isValueFirst && !hideColon;
  });

  protected readonly hasDynamicExpression = computed(() => {
    const labelExpression = this.labelExpression();
    const valueExpression = this.valueExpression();
    return !!labelExpression || !!valueExpression;
  });

  protected readonly itemLabel = computed(() => {
    const label = this.label();
    if (label?.value !== undefined && label?.value !== null) {
      if (typeof label.value === 'object') {
        return JSON.stringify(label.value);
      }
      return label.value.toString();
    }
    return label?.expression ?? '';
  });

  protected readonly itemValue = computed(() => {
    const value = this.value();
    if (value?.value !== undefined && value?.value !== null) {
      if (typeof value.value === 'object') {
        return JSON.stringify(value.value);
      }
      return value.value;
    }
    return value?.expression;
  });

  protected readonly trackOverflowContent = computed(() => {
    const hasIcon = !!this.item()?.icon;
    const label = this.itemLabel()?.toString() ?? '';
    const value = this.itemValue()?.toString() ?? '';
    return `${hasIcon ? '   ' : ''}${label}:${value}`;
  });

  protected displayValue($event: MouseEvent): void {
    const label = this.itemLabel()?.toString() ?? '';
    const value = this.itemValue()?.toString() ?? '';
    this.displayText($event, value, label);
  }

  protected displayText($event: MouseEvent, text: string, title: string = 'Dynamic expression'): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    if (!text) {
      return;
    }
    this._richEditorDialog.editText(text, {
      isReadOnly: true,
      title,
      predefinedMode: AceMode.TEXT,
      wrapText: true,
    });
  }

  protected readonly PopoverMode = PopoverMode;
}
