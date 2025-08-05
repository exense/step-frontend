import { Directive, input } from '@angular/core';
import { TreeVirtualScrollDirective } from './tree-virtual-scroll.directive';

@Directive({
  selector: '[stepTreeAutoChooseVirtualScroll]',
  hostDirectives: [
    {
      directive: TreeVirtualScrollDirective,
      inputs: ['stepTreeVirtualScroll: stepTreeAutoChooseVirtualScroll', 'minItemSizePx'],
    },
  ],
})
export class TreeAutoChooseVirtualScrollDirective {
  readonly applyVirtualScrollFrom = input.required<number>();
}
