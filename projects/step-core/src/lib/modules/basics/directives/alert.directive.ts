import { Directive, HostBinding, Input } from '@angular/core';
import { AlertType } from '../shared/alert-type.enum';

@Directive({
  selector: 'step-alert',
})
export class AlertDirective {
  @HostBinding('attr.role')
  readonly role = 'alert';

  @HostBinding('attr.type')
  @Input()
  type: AlertType | string = AlertType.DEFAULT;
}
