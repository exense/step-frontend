import { Directive, ElementRef, EventEmitter, Injector, Input, Output } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { AbstractArtefact } from '@exense/step-core';
import { ARTEFACT_DETAILS_WRAPPER } from '../angularjs/artefact-details-wrapper';

@Directive({
  selector: 'step-artefact-details',
})
export class ArtefactDetailsDirective extends UpgradeComponent {
  constructor(_elementRef: ElementRef, _injector: Injector) {
    super(ARTEFACT_DETAILS_WRAPPER, _elementRef, _injector);
  }

  @Input() artefact?: AbstractArtefact;
  @Input() readonly?: boolean;
  @Input() handle?: any;
  @Output() onSave = new EventEmitter<unknown>();
}
