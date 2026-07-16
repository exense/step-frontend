import { SplitComponent } from './components/split/split.component';
import { SplitAreaComponent } from './components/split-area/split-area.component';
import { SplitGutterComponent } from './components/split-gutter/split-gutter.component';
import { StackViewComponent } from './components/stack-view/stack-view.component';
import { StackViewItemComponent } from './components/stack-view-item/stack-view-item.component';
import { StackViewItemContentDirective } from './directives/stack-view-item-content.directive';
import { StackViewItemTitleDirective } from './directives/stack-view-item-title.directive';
import { StackViewBreadcrumbsTitleDirective } from './directives/stack-view-breadcrumbs-title.directive';
import { StackViewItemMiniatureDirective } from './directives/stack-view-item-miniature.directive';
import { ViewItemDefaultNamePipe } from './pipes/view-item-default-name.pipe';
import { StackViewGroupTooltipDirective } from './directives/stack-view-group-tooltip.directive';

export * from './components/split/split.component';
export * from './components/split-area/split-area.component';
export * from './components/split-gutter/split-gutter.component';
export * from './components/stack-view/stack-view.component';
export * from './components/view-group/view-group.component';
export * from './components/view-item/view-item.component';
export * from './pipes/is-split-view-group.pipe';
export * from './pipes/view-item-default-name.pipe';
export * from './components/stack-view-item/stack-view-item.component';
export * from './directives/stack-view-item-title.directive';
export * from './directives/stack-view-item-content.directive';
export * from './directives/stack-view-breadcrumbs-title.directive';
export * from './directives/stack-view-item-miniature.directive';
export * from './directives/stack-view-group-tooltip.directive';

export const SPLIT_EXPORTS = [
  SplitComponent,
  SplitAreaComponent,
  SplitGutterComponent,
  StackViewComponent,
  StackViewItemComponent,
  StackViewItemContentDirective,
  StackViewItemTitleDirective,
  StackViewBreadcrumbsTitleDirective,
  StackViewItemMiniatureDirective,
  StackViewGroupTooltipDirective,
  ViewItemDefaultNamePipe,
];
