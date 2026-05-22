import { Component, input } from '@angular/core';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';

@Component({
  selector: 'step-alt-iteration-list-title',
  templateUrl: './alt-iteration-list-title.component.html',
  styleUrl: './alt-iteration-list-title.component.scss',
  standalone: false,
})
export class AltIterationListTitleComponent {
  readonly node = input<AggregatedTreeNode | undefined>();
}
