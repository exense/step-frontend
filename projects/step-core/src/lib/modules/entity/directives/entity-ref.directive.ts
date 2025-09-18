import { Directive, forwardRef, inject, Injector, input } from '@angular/core';
import { EntityRefService } from '../injectables/entity-ref.service';

@Directive({
  selector: '[stepEntityRef]',
  providers: [
    {
      provide: EntityRefService,
      useExisting: forwardRef(() => EntityRefDirective),
    },
  ],
  exportAs: 'EntityRef',
})
export class EntityRefDirective<E extends { attributes?: Record<string, string> }> implements EntityRefService {
  readonly _injector = inject(Injector);
  readonly entity = input.required<E>({ alias: 'stepEntityRef' });

  getCurrentEntity<T extends { attributes?: Record<string, string> }>(): T {
    return this.entity() as unknown as T;
  }
}
