import { Component, OnInit } from '@angular/core';
import { TreeStateService } from '../../services/tree-state.service';
import { map, of } from 'rxjs';
import { Mutable } from '../../../../shared';
import { TreeNode } from '../../shared/tree-node';

type FieldAccessor = Mutable<Pick<TreeDragPreviewComponent, 'label$' | 'icon$'>>;

@Component({
  selector: 'step-tree-drag-preview',
  templateUrl: './tree-drag-preview.component.html',
  styleUrls: ['./tree-drag-preview.component.scss'],
})
export class TreeDragPreviewComponent implements OnInit {
  readonly label$ = of('');
  readonly icon$ = of('');

  constructor(private _treeState: TreeStateService<any, TreeNode>) {}

  ngOnInit(): void {
    this.setupLabelAndIcon();
  }

  private setupLabelAndIcon(): void {
    const labelAndIcon$ = this._treeState.selectedNodes$.pipe(
      map((nodes) => {
        let label = '';
        let icon = '';

        if (nodes.length === 1) {
          label = nodes[0].name;
          icon = nodes[0].icon;
        } else if (nodes.length > 1) {
          label = `(${nodes.length}) items`;
          icon = 'list';
        }

        return { label, icon };
      })
    );

    (this as FieldAccessor).label$ = labelAndIcon$.pipe(map((x) => x.label));
    (this as FieldAccessor).icon$ = labelAndIcon$.pipe(map((x) => x.icon));
  }
}
