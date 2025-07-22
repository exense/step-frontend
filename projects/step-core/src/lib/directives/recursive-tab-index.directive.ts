import { AfterViewInit, Directive, ElementRef, inject, Input } from '@angular/core';
import { breadthFirstSearch } from '../shared';

/**
 * Documentation:
 * https://exense.atlassian.net/wiki/spaces/DEVELOPMEN/pages/587333633/RecursiveTabIndexDirective
 */

@Directive({
  selector: '[stepRecursiveTabIndex]',
  standalone: false,
})
export class RecursiveTabIndexDirective implements AfterViewInit {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input('stepRecursiveTabIndex') tabIndex!: number;

  ngAfterViewInit(): void {
    breadthFirstSearch({
      items: Array.from(this._elementRef.nativeElement.children),
      children: (item) => Array.from(item.children),
    }).forEach((element) => {
      element.setAttribute('tabindex', this.tabIndex.toString());
    });
  }
}
