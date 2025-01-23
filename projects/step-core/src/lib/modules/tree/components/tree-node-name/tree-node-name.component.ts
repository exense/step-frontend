import { Component, computed, effect, ElementRef, inject, input, viewChild, ViewEncapsulation } from '@angular/core';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeNode } from '../../types/tree-node';
import { TreeNodeTemplateContainerService } from '../../services/tree-node-template-container.service';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-tree-node-name',
  templateUrl: './tree-node-name.component.html',
  styleUrl: './tree-node-name.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [StepBasicsModule],
})
export class TreeNodeNameComponent {
  private _treeState = inject<TreeStateService<any, TreeNode>>(TreeStateService);

  readonly templateContainer = inject(TreeNodeTemplateContainerService);

  node = input<TreeNode | undefined>();

  readonly isEditMode = computed(() => {
    const editNodeId = this._treeState.editNodeId();
    return !!editNodeId && editNodeId === this.node()?.id;
  });

  readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('inputElement');

  private enterEditEffect = effect(() => {
    const isEditMode = this.isEditMode();
    if (!isEditMode) {
      return;
    }
    const inputElement = this.inputElement()?.nativeElement;
    if (!inputElement) {
      return;
    }
    inputElement.value = this.node()?.name ?? '';
    setTimeout(() => inputElement.focus(), 50);
  });

  submitNameChange(): void {
    this._treeState.updateEditNodeName(this.inputElement()!.nativeElement.value);
  }
}
