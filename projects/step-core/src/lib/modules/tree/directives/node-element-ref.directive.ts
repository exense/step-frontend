import { AfterViewInit, Directive, ElementRef, inject, Input } from '@angular/core';
import { TreeFlatNode } from '../shared/tree-flat-node';

@Directive({
  selector: '[stepNodeElementRef]',
})
export class NodeElementRefDirective {
  readonly _element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  @Input('stepNodeElementRef') node!: TreeFlatNode;
}
