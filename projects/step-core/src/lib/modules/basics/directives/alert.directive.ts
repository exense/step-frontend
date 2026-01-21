import { Directive, HostBinding, Input } from '@angular/core';
import { AlertType } from '../types/alert-type.enum';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'step-alert',
  standalone: false,
})
export class AlertDirective {
  @HostBinding('attr.role')
  readonly role = 'alert';

  @HostBinding('attr.type')
  @Input()
  type: AlertType | string = AlertType.DEFAULT;
}
