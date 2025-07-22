import { Directive, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[stepElementRefMap]',
  standalone: false,
})
export class ElementRefMapDirective implements OnInit, OnDestroy {
  public _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() key?: string;
  @Input() parentKey?: string;

  static readonly instancesByKey = new Map<string, ElementRefMapDirective[]>();

  ngOnInit(): void {
    if (!this.key) {
      return;
    }

    const instances = ElementRefMapDirective.instancesByKey.get(this.key);

    if (!instances) {
      ElementRefMapDirective.instancesByKey.set(this.key, [this]);
    } else {
      instances.push(this);
    }
  }

  ngOnDestroy(): void {
    if (!this.key) {
      return;
    }

    const instances = ElementRefMapDirective.instancesByKey.get(this.key);

    if (!instances) {
      return;
    }

    instances.splice(instances.indexOf(this), 1);
  }
}
