import { Directive, ElementRef, Injector } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { LEGACY_OUTLET } from '../angularjs/directives/legacy-outlet.directive';

@Directive({
  selector: 'step-legacy-outlet-wrapper',
})
export class LegacyOutletWrapperDirective extends UpgradeComponent {
  constructor(_elRef: ElementRef, _injector: Injector) {
    super(LEGACY_OUTLET, _elRef, _injector);
  }
}
