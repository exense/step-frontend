import { computed, Directive, inject, input, TemplateRef, untracked } from '@angular/core';
import { GridTemplateItem } from '../types/grid-template-item';
import { toObservable } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[stepGridItem]',
})
export class GridItemDirective {
  private readonly _templateRef = inject(TemplateRef);
  readonly widgetType = input.required<string>({ alias: 'stepGridItem' });

  private readonly item = computed(() => {
    const widgetType = this.widgetType();
    const templateRef = this._templateRef;
    return { widgetType, templateRef } as GridTemplateItem;
  });

  readonly item$ = toObservable(this.item);
}
