import { Component, ElementRef, inject, ViewEncapsulation } from '@angular/core';
import { TreeStateService } from '@exense/step-core';
import { filter, map, switchMap, tap, timer } from 'rxjs';

@Component({
  selector: 'step-alt-execution-tree',
  templateUrl: './alt-execution-tree.component.html',
  styleUrl: './alt-execution-tree.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionTreeComponent {
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private _treeSate = inject(TreeStateService);

  focusNode(nodeId: string): void {
    this._treeSate
      .expandNode(nodeId)
      .pipe(
        map((isExpanded) => (isExpanded ? nodeId : undefined)),
        filter((isExpanded) => !!isExpanded),
        tap((nodeId) => this._treeSate.selectNode(nodeId)),
        switchMap((nodeId) => timer(500).pipe(map(() => nodeId))),
      )
      .subscribe((nodeId) => {
        const nodeElement = this._el.nativeElement.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`);
        nodeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
  }
}
