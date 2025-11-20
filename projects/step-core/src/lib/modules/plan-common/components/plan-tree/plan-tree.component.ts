import {
  AfterViewInit,
  Component,
  computed,
  contentChild,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  Input,
  output,
  Signal,
  viewChild,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { filter, map, Observable, of, partition } from 'rxjs';
import { AbstractArtefact } from '../../../../client/generated';
import { TreeAction, TreeActionsService, TreeComponent, TreeNode, TreeStateService, TREE_EXPORTS } from '../../../tree';
import { ArtefactChildContainerSettingsComponent } from '../artefact-child-container-settings/artefact-child-container-settings.component';
import { ArtefactDetailsComponent } from '../artefact-details/artefact-details.component';
import { ArtefactTreeNode } from '../../types/artefact-tree-node';
import { PlanArtefactResolverService } from '../../injectables/plan-artefact-resolver.service';
import { PlanEditorService } from '../../injectables/plan-editor.service';
import { PlanInteractiveSessionService } from '../../injectables/plan-interactive-session.service';
import { PlanTreeAction } from '../../types/plan-tree-action.enum';
import { DragDataService, DropInfo, DragEndType, DRAG_DROP_EXPORTS } from '../../../drag-drop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SPLIT_EXPORTS } from '../../../split';
import { StepIconsModule } from '../../../step-icons/step-icons.module';
import { AsyncPipe } from '@angular/common';
import { StepMaterialModule } from '../../../step-material/step-material.module';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { PlanTreeLeftPanelDirective } from '../../directives/plan-tree-left-panel.directive';
import { PlanTreeRightPanelDirective } from '../../directives/plan-tree-right-panel.directive';

@Component({
  selector: 'step-plan-tree',
  templateUrl: './plan-tree.component.html',
  styleUrl: './plan-tree.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    SPLIT_EXPORTS,
    DRAG_DROP_EXPORTS,
    StepMaterialModule,
    StepBasicsModule,
    TREE_EXPORTS,
    StepIconsModule,
    ArtefactDetailsComponent,
    ArtefactChildContainerSettingsComponent,
    AsyncPipe,
  ],
  providers: [
    {
      provide: TreeActionsService,
      useExisting: forwardRef(() => PlanTreeComponent),
    },
  ],
})
export class PlanTreeComponent implements AfterViewInit, TreeActionsService {
  private _destroyRef = inject(DestroyRef);

  private _treeState = inject<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);
  private _planArtefactResolver? = inject(PlanArtefactResolverService, { optional: true });
  readonly _planEditService = inject(PlanEditorService);
  readonly _planInteractiveSession? = inject(PlanInteractiveSessionService, { optional: true });

  readonly activeNode: Signal<ArtefactTreeNode | undefined> = this._treeState.selectedNode;

  private readonly leftPanel = contentChild(PlanTreeLeftPanelDirective);
  private readonly rightPanel = contentChild(PlanTreeRightPanelDirective);

  protected readonly templateLeftPanel = computed(() => this.leftPanel()?._templateRef);
  protected readonly templateRightPanel = computed(() => this.rightPanel()?._templateRef);

  protected readonly headerLeftPanel = computed(() => this.leftPanel()?.header());
  protected readonly headerRightPanel = computed(() => this.rightPanel()?.header());

  protected readonly sizeTypeLeftPanel = computed(() => {
    const leftPanel = this.leftPanel();
    return leftPanel?.sizeType?.() || 'pixel';
  });

  protected readonly sizeTypeRightPanel = computed(() => {
    const rightPanel = this.rightPanel();
    return rightPanel?.sizeType?.() || 'pixel';
  });

  readonly externalObjectDrop = output<DropInfo>();

  @Input() isReadonly: boolean = false;

  @ViewChild(TreeComponent) tree?: TreeComponent<ArtefactTreeNode>;

  private dragData = viewChild(DragDataService);

  private actions: TreeAction[] = [
    { id: PlanTreeAction.OPEN, label: 'Open (Ctrl + O)' },
    { id: PlanTreeAction.RENAME, label: 'Rename (F2)' },
    { id: PlanTreeAction.ENABLE, label: 'Enable (Ctrl + E)', hasSeparator: true },
    { id: PlanTreeAction.DISABLE, label: 'Disable (Ctrl + E)', hasSeparator: true },
    { id: PlanTreeAction.COPY, label: 'Copy (Ctrl + C)' },
    { id: PlanTreeAction.PASTE, label: 'Paste (Ctrl + V)' },
    { id: PlanTreeAction.DUPLICATE, label: 'Duplicate (Ctrl + D)' },
    { id: PlanTreeAction.DELETE, label: 'Delete (Del)', hasSeparator: true },
    { id: PlanTreeAction.MOVE_UP, label: 'Move Up (Ctrl + ⬆️)' },
    { id: PlanTreeAction.MOVE_DOWN, label: 'Move Down (Ctrl + ⬇️)' },
    { id: PlanTreeAction.MOVE_LEFT, label: 'Move Left (Ctrl + ⬅️)' },
    { id: PlanTreeAction.MOVE_RIGHT, label: 'Move Right (Ctrl + ➡️)' },
  ];

  private actionsMultiple: TreeAction[] = [
    { id: PlanTreeAction.OPEN, label: 'Open (Ctrl + O)', disabled: true },
    { id: PlanTreeAction.RENAME, label: 'Rename (F2)', disabled: true },
    { id: PlanTreeAction.ENABLE, label: 'Enable All Selected (Ctrl + E)', hasSeparator: true },
    { id: PlanTreeAction.DISABLE, label: 'Disable All Selected (Ctrl + E)', hasSeparator: true },
    { id: PlanTreeAction.COPY, label: 'Copy All Selected (Ctrl + C)' },
    { id: PlanTreeAction.PASTE, label: 'Paste (Ctrl + V)' },
    { id: PlanTreeAction.DUPLICATE, label: 'Duplicate All Selected (Ctrl + D)' },
    { id: PlanTreeAction.DELETE, label: 'Delete All Selected (Del)', hasSeparator: true },
    { id: PlanTreeAction.MOVE_UP, label: 'Move Up All Selected (Ctrl + ⬆️)' },
    { id: PlanTreeAction.MOVE_DOWN, label: 'Move Down All Selected (Ctrl + ⬇️)' },
    { id: PlanTreeAction.MOVE_LEFT, label: 'Move Left All Selected (Ctrl + ⬅️)' },
    { id: PlanTreeAction.MOVE_RIGHT, label: 'Move Right All Selected (Ctrl + ➡️)' },
  ];

  private candidatesForDropInsert: string[] = [];

  ngAfterViewInit(): void {
    this.setupDragStart();
    this.setupDragEnd();
  }

  getActionsForNode(node: ArtefactTreeNode, multipleNodes?: boolean): Observable<TreeAction[]> {
    const isSkipped = node.isSkipped;
    const actions = multipleNodes ? this.actionsMultiple : this.actions;

    return of(actions).pipe(
      map((actions) =>
        actions
          .map((action) => {
            let disabled = false;
            if (this.isReadonly || action.disabled) {
              disabled = true;
            } else if (action.id === PlanTreeAction.OPEN) {
              disabled = !this.canOpenArtefact(node.originalArtefact);
            }

            return { ...action, disabled };
          })
          .filter((action) => {
            if (action.id === PlanTreeAction.DISABLE && isSkipped && !multipleNodes) {
              return false;
            }

            if (action.id === PlanTreeAction.ENABLE && !isSkipped && !multipleNodes) {
              return false;
            }

            if (multipleNodes && action.id === PlanTreeAction.ENABLE) {
              action.hasSeparator = false;
            }

            return true;
          }),
      ),
    );
  }

  openTreeMenu(event: MouseEvent, nodeId: string): void {
    if (!this.tree) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    this.tree.openContextMenu({
      event,
      nodeId,
    });
  }

  hasActionsForNode(treeNode: TreeNode): boolean {
    const node = this._treeState.findNodeById(treeNode?.id);
    return node?.nodeType === undefined;
  }

  handleDoubleClick(node: ArtefactTreeNode, event: MouseEvent): void {
    if (!this.canOpenArtefact(node.originalArtefact) || !this._planArtefactResolver) {
      return;
    }
    event.preventDefault();
    this._planArtefactResolver.openArtefact(node.originalArtefact);
  }

  handleDragOver(event: DropInfo): void {
    if (!this._treeState.rootNodeId()) {
      return;
    }
    const isTreeNode = typeof event.draggedElement === 'string';
    const newParentId = (event.droppedArea ?? this._treeState.rootNodeId()) as string;
    if (isTreeNode && !this._treeState.canInsertTo(this.candidatesForDropInsert, newParentId)) {
      return;
    }
    this._treeState.notifyPotentialInsert?.(newParentId);
  }

  handleDropNode(event: DropInfo): void {
    if (!this._treeState.rootNodeId()) {
      this._treeState.notifyInsertionComplete?.();
      return;
    }
    const newParentId = (event.droppedArea ?? this._treeState.rootNodeId()) as string;
    const dropAdditionalInfo = event.additionalInfo as string | undefined;

    const isTreeNode = typeof event.draggedElement === 'string';
    if (!isTreeNode) {
      this.externalObjectDrop.emit(event);
      return;
    }

    if (!this._treeState.canInsertTo(this.candidatesForDropInsert, newParentId)) {
      this._treeState.notifyInsertionComplete?.();
      return;
    }

    if (!dropAdditionalInfo) {
      this._treeState.insertNodesTo(this.candidatesForDropInsert, newParentId);
    } else if (dropAdditionalInfo === 'first') {
      this._treeState.insertNodesTo(this.candidatesForDropInsert, newParentId, { insertAtFirstPosition: true });
    } else {
      const insertAfterSiblingId = dropAdditionalInfo as string;
      this._treeState.insertNodesTo(this.candidatesForDropInsert, newParentId, { insertAfterSiblingId });
    }
    this._treeState.notifyInsertionComplete?.();
  }

  proceedAction(actionId: string, node?: ArtefactTreeNode, multipleNodes?: boolean): void {
    const artefact = multipleNodes ? undefined : node?.originalArtefact;
    const forceSkip = actionId === PlanTreeAction.DISABLE;
    switch (actionId) {
      case PlanTreeAction.RENAME:
        this._planEditService.rename(artefact);
        break;
      case PlanTreeAction.MOVE_UP:
        this._planEditService.moveUp(artefact);
        break;
      case PlanTreeAction.MOVE_DOWN:
        this._planEditService.moveDown(artefact);
        break;
      case PlanTreeAction.MOVE_LEFT:
        this._planEditService.moveOut(artefact);
        break;
      case PlanTreeAction.MOVE_RIGHT:
        this._planEditService.moveInPrevSibling(artefact);
        break;
      case PlanTreeAction.COPY:
        this._planEditService.copy(artefact);
        break;
      case PlanTreeAction.PASTE:
        this._planEditService.paste(artefact);
        break;
      case PlanTreeAction.DUPLICATE:
        this._planEditService.duplicate(artefact);
        break;
      case PlanTreeAction.DELETE:
        this._planEditService.delete(artefact);
        break;
      case PlanTreeAction.OPEN:
        this._planArtefactResolver?.openArtefact(artefact);
        break;
      case PlanTreeAction.DISABLE:
      case PlanTreeAction.ENABLE:
        this._planEditService?.toggleSkip(artefact, forceSkip);
        break;
      default:
        break;
    }
  }

  handlePlanChange() {
    // Timeout is needed to prevent update issue when clicking into the tree and leaving a property field that triggers
    // a plan change
    setTimeout(() => {
      const ctx = this._planEditService.planContext();
      this._planEditService.handlePlanContextChange(!ctx ? undefined : { ...ctx });
    }, 200);
  }

  private canOpenArtefact(artefact?: AbstractArtefact): boolean {
    if (!artefact) {
      return false;
    }
    return ['CallPlan', 'CallKeyword'].includes(artefact._class);
  }

  private setupDragStart(): void {
    const dragData = this.dragData()!;
    const dragData$ = dragData.dragData$.pipe(
      filter((dragItemId) => !!dragItemId),
      takeUntilDestroyed(this._destroyRef),
    );

    const [internalDrag$, externalDrag$] = partition(dragData$, (dragData) => typeof dragData === 'string');

    (internalDrag$ as Observable<string>).subscribe((dragItemId) => {
      const draggingIds = [...this._treeState.selectedNodeIds(), dragItemId];
      this.candidatesForDropInsert = this._treeState.findSubtreeRootsAmongIds(draggingIds);
    });

    externalDrag$.subscribe(() => {
      const selectedForInsert = this._treeState.selectedForInsertCandidate();
      if (selectedForInsert) {
        this._treeState.notifyPotentialInsert?.(selectedForInsert);
      }
    });
  }

  private setupDragEnd(): void {
    const dragData = this.dragData()!;
    dragData.dragEnd$
      .pipe(
        filter((dragEndType) => dragEndType === DragEndType.STOP),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this.candidatesForDropInsert = [];
        this._treeState.notifyInsertionComplete?.();
      });
  }
}
