import { Directive, input } from '@angular/core';
import { TreeVirtualScrollDirective } from './tree-virtual-scroll.directive';

@Directive({
  selector: '[stepTreeAutoChooseVirtualScroll]',
  standalone: true,
  hostDirectives: [
    {
      directive: TreeVirtualScrollDirective,
      inputs: ['stepTreeVirtualScroll: stepTreeAutoChooseVirtualScroll', 'maxBufferPx', 'minBufferPx'],
    },
  ],
})
export class TreeAutoChooseVirtualScrollDirective {
  readonly applyVirtualScrollFrom = input.required<number>();
}
