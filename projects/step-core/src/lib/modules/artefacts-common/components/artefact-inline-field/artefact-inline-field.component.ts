import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AceMode, RichEditorDialogService } from '../../../rich-editor';
import { ArtefactInlineItem } from '../../types/artefact-inline-item';
import { PopoverMode, StepBasicsModule } from '../../../basics/step-basics.module';
import { ArtefactInlineItemExplicitWidths } from '../../types/artefact-inline-item-explicit-widths';
import { WidthContainer } from '../../types/width-container';

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
    '[style.--style__prefix-width.px]': 'explicitWidths()?.prefix',
    '[style.--style__label-width.px]': 'explicitWidths()?.label',
    '[style.--style__value-width.px]': 'explicitWidths()?.value',
    '[style.--style__icon-width.px]': 'explicitWidths()?.icon',
    '[style.--style__suffix-width.px]': 'explicitWidths()?.suffix',
  },
})
export class ArtefactInlineFieldComponent {
  private _richEditorDialog = inject(RichEditorDialogService);

  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private elPrefix = viewChild('elPrefix', { read: ElementRef<HTMLElement> });
  private elLabel = viewChild('elLabel', { read: ElementRef<HTMLElement> });
  private elValue = viewChild('elValue', { read: ElementRef<HTMLElement> });
  private elIcon = viewChild('elIcon', { read: ElementRef<HTMLElement> });
  private elSuffix = viewChild('elSuffix', { read: ElementRef<HTMLElement> });

  readonly elementCount = computed(() => {
    const elPrefix = this.elPrefix();
    const elLabel = this.elLabel();
    const elValue = this.elValue();
    const elIcon = this.elIcon();
    const elSuffix = this.elSuffix();
    return [elPrefix, elLabel, elValue, elIcon, elSuffix].filter((element) => !!element).length;
  });

  readonly widthPrefix = computed<number | undefined>(() => this.fixWidth(this.elPrefix()?.nativeElement?.offsetWidth));
  readonly widthLabel = computed<number | undefined>(() => this.fixWidth(this.elLabel()?.nativeElement?.offsetWidth));
  readonly widthValue = computed<number | undefined>(() => this.fixWidth(this.elValue()?.nativeElement?.offsetWidth));
  readonly widthIcon = computed<number | undefined>(() => this.fixWidth(this.elIcon()?.nativeElement?.offsetWidth));
  readonly widthSuffix = computed<number | undefined>(() => this.fixWidth(this.elSuffix()?.nativeElement?.offsetWidth));

  private fixWidth(width?: number): number | undefined {
    if (!width) {
      return width;
    }
    return width + 1;
  }

  getCount(): number {
    return this.elementCount();
  }

  getWidths(): WidthContainer {
    const prefix = this.widthPrefix();
    const label = this.widthLabel();
    const value = this.widthValue();
    const icon = this.widthIcon();
    const suffix = this.widthSuffix();

    const result: WidthContainer = { prefix, label, value, icon, suffix };
    let total = [prefix, label, value, icon, suffix]
      .filter((item) => item !== undefined)
      .reduce((res, item, index, self) => {
        let value = res + item;
        if (index < self.length - 1) {
          value += 1;
        }
        return value;
      }, 0);
    result.total = total;
    return result;
  }

  getItem(): ArtefactInlineItem {
    return this.item();
  }

  readonly item = input.required<ArtefactInlineItem>();
  readonly applyExplicitWidths = input(false);

  protected explicitWidths = computed(() => {
    const item = this.item() as ArtefactInlineItemExplicitWidths;
    const applyExplicitWidths = this.applyExplicitWidths();
    return applyExplicitWidths ? item?.explicitWidths : undefined;
  });

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

  /*
  protected readonly trackOverflowContent = computed(() => {
    const hasIcon = !!this.item()?.icon;
    const label = this.itemLabel()?.toString() ?? '';
    const value = this.itemValue()?.toString() ?? '';
    return `${hasIcon ? '   ' : ''}${label}:${value}`;
  });
*/

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
