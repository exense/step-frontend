import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { KEYWORD_WRAPPER } from '../angularjs/keywordcalls-wrapper';

@Directive({
  selector: 'step-keyword-wrapper',
})
export class KeywordWrapperDirective extends UpgradeComponent {
  constructor(_elementRef: ElementRef, _injector: Injector) {
    super(KEYWORD_WRAPPER, _elementRef, _injector);
  }

  @Input() stepsTable: any;
  @Input() stepsTableServerSideParameters: any;
  @Input() executionViewServices: any;
  @Input() reportNodeStatusOptions: any;
}
