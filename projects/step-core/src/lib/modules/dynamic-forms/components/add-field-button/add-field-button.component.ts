import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'step-add-field-button',
  templateUrl: './add-field-button.component.html',
  styleUrls: ['./add-field-button.component.scss'],
})
export class AddFieldButtonComponent {
  protected showPossibleFields = false;

  @Input() possibleFields: string[] = [];
  @Output() addField = new EventEmitter<string | undefined>();

  constructor(private _elRef: ElementRef) {}

  protected addOptionalField(event: MouseEvent): void {
    event.stopPropagation();
    if (this.possibleFields.length > 0) {
      this.showPossibleFields = true;
      return;
    }
    this.addField.emit();
  }

  @HostListener('document:click', ['$event'])
  private onDocumentClick(event: MouseEvent): void {
    if (!this.showPossibleFields || this._elRef.nativeElement.contains(event.target)) {
      return;
    }
    this.showPossibleFields = false;
  }
}
