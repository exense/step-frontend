import { ChangeDetectionStrategy, Component, computed, inject, input, output, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { PopoverMode } from '../../../basics/components/popover/popover.component';
import { DragDataService, DRAG_DROP_EXPORTS, DropInfo } from '../../../drag-drop';
import { StepIconsModule } from '../../../step-icons/step-icons.module';
import { TreeStateService } from '../../../tree';
import { AbstractArtefact } from '../../../../client/generated';
import { PlanDropHintComponent } from '../plan-drop-hint/plan-drop-hint.component';
import { ArtefactNodeSource } from '../../types/artefact-node-source.enum';
import { ArtefactTreeNode } from '../../types/artefact-tree-node';

@Component({
  selector: 'step-plan-node-drop-sections',
  imports: [DRAG_DROP_EXPORTS, StepBasicsModule, StepIconsModule, PlanDropHintComponent],
  templateUrl: './plan-node-drop-sections.component.html',
  styleUrl: './plan-node-drop-sections.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PlanNodeDropSectionsComponent {
  private readonly _dragData = inject(DragDataService);
  private readonly _treeState = inject<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);
  private readonly dragData = toSignal(this._dragData.dragData$);

  readonly node = input.required<ArtefactTreeNode>();
  readonly isReadonly = input(false);
  readonly dropNode = output<DropInfo>();

  protected readonly PopoverMode = PopoverMode;
  protected readonly sections = computed(() => {
    const node = this.node();
    const draggedElement = this.dragData();
    const isReadonly = this.isReadonly();
    if (!draggedElement || isReadonly || node.isDropDisabled) {
      return [];
    }
    return (node.dropSections ?? []).map((section) => ({
      ...section,
      isThreadSection:
        section.nodeType === ArtefactNodeSource.BEFORE_THREAD || section.nodeType === ArtefactNodeSource.AFTER_THREAD,
      disabled: this._treeState.canDropTo?.({ draggedElement, droppedArea: section.id }) === false,
    }));
  });
}
