import { computed, Directive, forwardRef, inject, input, signal } from '@angular/core';
import { ElementSizeService } from '@exense/step-core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'step-artefact-inline-details[parentElementSize]',
  providers: [
    {
      provide: ElementSizeService,
      useExisting: forwardRef(() => ParentElementSizeDirective),
    },
  ],
})
export class ParentElementSizeDirective implements ElementSizeService {
  private _parentElementSize = inject(ElementSizeService, { skipSelf: true, optional: true });

  readonly offset = input(150);

  readonly height = computed(() => this._parentElementSize?.height?.() ?? 0);

  readonly width = computed(() => {
    const parentWidth = this._parentElementSize?.width?.() ?? 0;
    let result = !parentWidth ? 0 : parentWidth - this.offset();
    result = Math.max(result, 200);
    return result;
  });
}
