import { Directive, HostListener, Input } from '@angular/core';

const NON_SYSTEM_KEYS = /^[a-z0-9?!.,-?*]$/i;

@Directive({
  selector: 'input[stepAllowChars]',
  standalone: false,
})
export class AllowCharsDirective {
  @Input('stepAllowChars') allowedChars?: string[];

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!NON_SYSTEM_KEYS.test(event.key)) {
      return;
    }
    if (this.allowedChars && this.allowedChars.includes(event.key)) {
      return;
    }
    event.preventDefault();
  }
}
