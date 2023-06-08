import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { ArtefactContext } from '../shared';

@Directive({
  selector: 'step-artefact-details-wrapper',
})
export class ArtefactDetailsWrapperDirective extends UpgradeComponent {
  constructor(_elementRef: ElementRef, _injector: Injector) {
    super('stepArtefactDetailsEditorWrapper', _elementRef, _injector);
  }

  @Input() templateUrl!: string;
  @Input() context!: ArtefactContext;
}
