import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'input[stepPreventChars]',
  standalone: false,
})
export class PreventCharsDirective {
  @Input('stepPreventChars') invalidChars?: string[];

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.invalidChars?.includes(event.key)) {
      event.preventDefault();
    }
  }
}
