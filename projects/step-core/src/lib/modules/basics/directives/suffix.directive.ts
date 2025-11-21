import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: 'step-suffix',
  standalone: false,
})
export class SuffixDirective {
  @Input() primary = false;

  @HostBinding('class.step-suffix') base = true;
  @HostBinding('class.step-suffix--primary') get isPrimary() {
    return this.primary;
  }
}
