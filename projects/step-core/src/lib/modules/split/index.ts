import { SplitComponent } from './components/split/split.component';
import { SplitAreaComponent } from './components/split-area/split-area.component';
import { SplitGutterComponent } from './components/split-gutter/split-gutter.component';
import { StackViewComponent } from './components/stack-view/stack-view.component';
import { StackViewItemDirective } from './directives/stack-view-item.directive';

export * from './components/split/split.component';
export * from './components/split-area/split-area.component';
export * from './components/split-gutter/split-gutter.component';
export * from './components/stack-view/stack-view.component';
export * from './components/view-group/view-group.component';
export * from './components/view-item/view-item.component';
export * from './directives/stack-view-item.directive';
export * from './pipes/is-split-view-group.pipe';

export const SPLIT_EXPORTS = [
  SplitComponent,
  SplitAreaComponent,
  SplitGutterComponent,
  StackViewComponent,
  StackViewItemDirective,
];
