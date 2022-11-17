import { UpgradeComponent } from '@angular/upgrade/static';
import { Directive, ElementRef, EventEmitter, Injector, Input, Output } from '@angular/core';
import { CUSTOM_FORM_WRAPPER } from '../angularjs/custom-form-wrapper';

@Directive({
  selector: 'step-custom-form',
})
export class CustomFormDirective extends UpgradeComponent {
  constructor(_elementRef: ElementRef, _injector: Injector) {
    super(CUSTOM_FORM_WRAPPER, _elementRef, _injector);
  }

  @Input() stScreen?: string;
  @Input() stModel?: Object;
  @Input() stDisabled?: boolean;
  @Input() stInline?: boolean;
  @Input() stExcludeFields?: string[];
  @Output() stOnChange = new EventEmitter<unknown>();
}
