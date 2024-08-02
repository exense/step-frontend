import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostBinding,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ArrayItemLabelValueExtractor, StepBasicsModule } from '../../../basics/step-basics.module';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-add-field-button',
  standalone: true,
  imports: [StepBasicsModule],
  templateUrl: './add-field-button.component.html',
  styleUrl: './add-field-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.child-mode]': 'isChildMode()',
  },
})
export class AddFieldButtonComponent<T = string> {
  private _elRef = inject(ElementRef);

  readonly isChildMode = input(false);
  readonly addLabel = input<string>('Add field');
  readonly addCustomLabel = input<string>('Add field');
  readonly possibleFields = input<T[]>([]);
  readonly extractor = input<ArrayItemLabelValueExtractor<T, unknown>>({
    getValue: (item: T) => item,
    getLabel: (item: T) => (item as string).toString(),
  });
  readonly addField = output<T | undefined>();

  protected showPossibleFields = signal(false);

  protected displayItems = computed(() => {
    const possibleFields = this.possibleFields();
    const extractor = this.extractor();
    return possibleFields.map((item) => {
      const key = extractor.getValue(item);
      const value = extractor.getLabel(item);
      return { key, value, item } as KeyValue<T, string>;
    });
  });

  protected hasPossibleFields = computed(() => !!this.possibleFields().length);

  protected addOptionalField(event: MouseEvent): void {
    event.stopPropagation();
    if (!!this.possibleFields().length) {
      this.showPossibleFields.set(true);
      return;
    }
    this.addField.emit(undefined);
  }

  protected addPredefinedField(fieldItem: T): void {
    this.addField.emit(this.extractor().getValue(fieldItem) as T);
  }

  @HostListener('document:click', ['$event'])
  protected handleDocumentClick(event: MouseEvent): void {
    if (!this.showPossibleFields() || this._elRef.nativeElement.contains(event.target)) {
      return;
    }
    this.showPossibleFields.set(false);
  }
}
