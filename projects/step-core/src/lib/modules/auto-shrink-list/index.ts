import { AutoShrinkListComponent } from './components/auto-shrink-list/auto-shrink-list.component';
import { AutoShrinkEmptyValueTemplateDirective } from './directives/auto-shrink-empty-value-template.directive';

export const AUTO_SHRINK_LIST_EXPORTS = [AutoShrinkListComponent, AutoShrinkEmptyValueTemplateDirective];

export * from './components/auto-shrink-list/auto-shrink-list.component';
export * from './components/auto-shrink-item-value/auto-shrink-item-value.component';
export * from './components/auto-shrink-all-items/auto-shrink-all-items.component';
export * from './injectables/item-width-register.service';
export * from './directives/auto-shrink-item.directive';
export * from './directives/auto-shrink-empty-value-template.directive';
