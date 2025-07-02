import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  Output,
  TrackByFunction,
} from '@angular/core';
import { ArrayItemLabelValueExtractor } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-add-field-button',
  templateUrl: './add-field-button.component.html',
  styleUrls: ['./add-field-button.component.scss'],
  providers: [
    {
      provide: ArrayItemLabelValueExtractor,
      useFactory: () => inject(AddFieldButtonComponent).extractor,
    },
  ],
  standalone: false,
})
export class AddFieldButtonComponent<T = string, V = string> {
  private _elRef = inject(ElementRef);

  protected showPossibleFields = false;

  @HostBinding('class.child-mode')
  @Input()
  isChildMode: boolean = false;

  @Input() addLabel: string = 'Add optional field';
  @Input() addCustomLabel?: string;
  @Input() possibleFields: T[] = [];
  @Input() extractor: ArrayItemLabelValueExtractor<T, V> = {
    getValue: (item: T) => item as unknown as V,
    getLabel: (item: T) => (item as string).toString(),
  };

  @Output() addField = new EventEmitter<V | undefined>();

  readonly trackByItem: TrackByFunction<T> = (index, item) => this.extractor.getValue(item);

  protected addOptionalField(event: MouseEvent): void {
    event.stopPropagation();
    if (this.possibleFields.length > 0) {
      this.showPossibleFields = true;
      return;
    }
    this.addField.emit();
  }

  protected addPredefinedField(fieldItem: T): void {
    this.addField.emit(this.extractor.getValue(fieldItem));
  }

  @HostListener('document:click', ['$event'])
  private onDocumentClick(event: MouseEvent): void {
    if (!this.showPossibleFields || this._elRef.nativeElement.contains(event.target)) {
      return;
    }
    this.showPossibleFields = false;
  }
}
