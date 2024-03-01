import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeNode } from '../../shared/tree-node';
import { TreeNodeTemplateContainerService } from '../../services/tree-node-template-container.service';

@Component({
  selector: 'step-tree-node-name',
  templateUrl: './tree-node-name.component.html',
  styleUrl: './tree-node-name.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TreeNodeNameComponent implements AfterViewInit {
  private _injector = inject(Injector);
  private _treeState = inject<TreeStateService<any, TreeNode>>(TreeStateService);

  readonly templateContainer = inject(TreeNodeTemplateContainerService);

  node = input<TreeNode | undefined>();

  readonly isEditMode = computed(() => {
    const editNodeId = this._treeState.editNodeId();
    return !!editNodeId && editNodeId === this.node()?.id;
  });

  @ViewChild('inputElement', { static: true })
  inputElement!: ElementRef;

  submitNameChange(): void {
    this._treeState.updateEditNodeName(this.inputElement.nativeElement.value);
  }

  ngAfterViewInit(): void {
    effect(
      () => {
        const isEditMode = this.isEditMode();
        const nodeName = this.node()?.name ?? '';
        if (isEditMode) {
          this.inputElement.nativeElement.value = nodeName;
          setTimeout(() => {
            this.inputElement.nativeElement.focus();
          }, 50);
        }
      },
      { injector: this._injector },
    );
  }
}
