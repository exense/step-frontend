import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { TreeNodeTemplateContainerService } from '../../services/tree-node-template-container.service';
import { TreeNodeDirective } from '../../directives/tree-node.directive';
import { NgTemplateOutlet } from '@angular/common';
import { StepIconsModule } from '../../../step-icons/step-icons.module';
import { TreeNodeNameComponent } from '../tree-node-name/tree-node-name.component';
import { StepMaterialModule } from '../../../step-material/step-material.module';

@Component({
  selector: 'step-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrl: './tree-node.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, StepIconsModule, StepMaterialModule, TreeNodeNameComponent],
  hostDirectives: [
    {
      directive: TreeNodeDirective,
      inputs: ['node'],
      outputs: ['contextMenu'],
    },
  ],
})
export class TreeNodeComponent {
  protected readonly _treeNode = inject(TreeNodeDirective, { self: true });
  protected readonly _treeNodeTemplateContainer = inject(TreeNodeTemplateContainerService);
}
