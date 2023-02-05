import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

declare global {
  interface Array<T> {
    bfsFilter: <T>({ predicate, children }: { predicate?: (item: T) => boolean; children: (item: T) => T[] }) => T[];
  }
}

/**
 * The time complexity of a Breadth-First Search (BFS) algorithm is O(|V| + |E|),
 * where |V| is the number of vertices and |E| is the number of edges in the graph being traversed.
 * The reason for this is that in the worst-case scenario, BFS needs to visit all vertices and all edges.
 */
Array.prototype.bfsFilter = function bfsFilter<T>({
  predicate = Boolean,
  children,
}: {
  predicate?: (item: T) => boolean;
  children: (item: T) => T[];
}) {
  if (!this.length) {
    return [];
  }

  const filtered: T[] = [];
  const queue: T[] = [this[0]];
  const visited = new Set<T>();

  while (queue.length) {
    const item = queue.shift() as T;

    visited.add(item);

    if (predicate(item)) {
      filtered.push(item);
    }

    const nonVisitedChildren = children(item).filter((child) => !visited.has(child));

    queue.push(...nonVisitedChildren);
  }

  return filtered;
};

@Directive({
  selector: '[stepRecursiveTabIndex]',
})
export class RecursiveTabIndexDirective implements AfterViewInit {
  @Input('stepRecursiveTabIndex') tabIndex!: number;

  constructor(private _elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    Array.from(this._elementRef.nativeElement.children)
      .bfsFilter<Element>({
        children: (element) => Array.from(element.children),
      })
      .forEach((element) => {
        element.setAttribute('tabindex', this.tabIndex.toString());
      });
  }
}
