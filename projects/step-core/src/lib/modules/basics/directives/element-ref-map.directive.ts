import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[stepElementRefMap]',
})
export class ElementRefMapDirective implements OnInit, OnDestroy {
  @Input() key?: string;
  @Input() parentKey?: string;

  static readonly instancesByKey = new Map<string, ElementRefMapDirective[]>();

  constructor(public _elementRef: ElementRef<HTMLElement>) {}

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

  static get childrenByKey(): Map<string, ElementRefMapDirective[]> {
    const childrenByKey = new Map<string, ElementRefMapDirective[]>();

    const flatInstances = Array.from(this.instancesByKey.values()).flatMap((instances) => [...instances]);

    for (const key of this.instancesByKey.keys()) {
      const children = flatInstances.filter((instance) => instance.parentKey === key);

      childrenByKey.set(key, children);
    }

    return childrenByKey;
  }
}
