import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { breadthFirstSearch } from '../shared';

@Directive({
  selector: '[stepRecursiveTabIndex]',
})
export class RecursiveTabIndexDirective implements AfterViewInit {
  @Input('stepRecursiveTabIndex') tabIndex!: number;

  constructor(private _elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    breadthFirstSearch({
      items: Array.from(this._elementRef.nativeElement.children),
      children: (item) => Array.from(item.children),
    }).forEach((element) => {
      element.setAttribute('tabindex', this.tabIndex.toString());
    });
  }
}
