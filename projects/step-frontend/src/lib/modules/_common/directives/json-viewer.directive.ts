import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { JSON_VIEWER_WRAPPER } from '../angularjs/json-viewer-wrapper';

@Directive({
  selector: 'step-json-viewer',
})
export class JsonViewerDirective extends UpgradeComponent {
  constructor(_elementRef: ElementRef, _injector: Injector) {
    super(JSON_VIEWER_WRAPPER, _elementRef, _injector);
  }

  @Input() format: 'kv' | 'json' = 'json';
  @Input() json: string | object = '';
}
