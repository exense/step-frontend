import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { SelectEntityContext } from '../types/select-entity-context.interface';
import { ENTITY_LEGACY_TABLE_WRAPPER } from '../angularjs/entity-legacy-table-wrapper.directive';

@Directive({
  selector: 'step-entity-legacy-table-wrapper',
})
export class EntityLegacyTableWrapperDirective extends UpgradeComponent {
  @Input() templateUrl?: string;
  @Input() context!: SelectEntityContext;

  constructor(_elementRef: ElementRef, _injector: Injector) {
    super(ENTITY_LEGACY_TABLE_WRAPPER, _elementRef, _injector);
  }
}
