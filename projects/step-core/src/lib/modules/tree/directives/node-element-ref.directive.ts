import { AfterViewInit, Directive, ElementRef, inject, Input } from '@angular/core';
import { TreeFlatNode } from '../shared/tree-flat-node';
import { Mutable } from '../../../shared';

type FieldAccessor = Mutable<Pick<NodeElementRefDirective, 'contentElement'>>;

@Directive({
  selector: '[stepNodeElementRef]',
})
export class NodeElementRefDirective implements AfterViewInit {
  readonly _element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly contentElement?: HTMLElement;

  @Input('stepNodeElementRef') node!: TreeFlatNode;

  ngAfterViewInit(): void {
    (this as FieldAccessor).contentElement = this._element.querySelector('.node-content') as HTMLElement;
  }
}
