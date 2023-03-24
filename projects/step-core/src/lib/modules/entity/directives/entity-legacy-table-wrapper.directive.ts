import { Directive, ElementRef, Injector, Input, Output } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { SelectEntityContext } from '../types/select-entity-context.interface';

@Directive({
  selector: 'step-entity-legacy-table-wrapper'
})
export class EntityLegacyTableWrapperDirective extends UpgradeComponent {
  @Input() templateUrl?: string;
  @Input() context!: SelectEntityContext;

  constructor(_elementRef: ElementRef, _injector: Injector) {
    super('stEntityLegacyTableWrapper',_elementRef, _injector);
  }

}
