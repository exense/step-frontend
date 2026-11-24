import { computed, Directive, input } from '@angular/core';

export interface GridItemCondition {
  readonly widgetType: string;
  readonly description: string;
}

/**
 * Declares why a widget might be hidden. Must be a direct content child of `step-grid-layout`,
 * placed outside the `@if` that hides the widget.
 */
@Directive({
  selector: '[stepGridItemCondition]',
})
export class GridItemConditionDirective {
  readonly widgetType = input.required<string>({ alias: 'stepGridItemCondition' });
  readonly description = input.required<string>({ alias: 'stepGridItemConditionDescription' });

  readonly condition = computed<GridItemCondition>(() => {
    const widgetType = this.widgetType();
    const description = this.description();
    return { widgetType, description };
  });
}
