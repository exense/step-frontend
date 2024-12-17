import {
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  Input,
  output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { AbstractArtefact } from '../../client/generated';
import {
  TreeAction,
  TreeActionsService,
  TreeComponent,
  TreeNode,
  TreeStateService,
} from '../../modules/tree/tree.module';
import {
  ArtefactNodeSource,
  ArtefactTreeNode,
  PlanArtefactResolverService,
  PlanEditorPersistenceStateService,
  PlanEditorService,
  PlanInteractiveSessionService,
  PlanTreeAction,
} from '../../modules/plan-common';
import { DropInfo } from '../../modules/drag-drop';

const TREE_SIZE = 'TREE_SIZE';
const ARTEFACT_DETAILS_SIZE = 'ARTEFACT_DETAILS_SIZE';

@Component({
  selector: 'step-plan-tree',
  templateUrl: './plan-tree.component.html',
  styleUrl: './plan-tree.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: TreeActionsService,
      useExisting: forwardRef(() => PlanTreeComponent),
    },
  ],
})
export class PlanTreeComponent implements TreeActionsService {
  private _treeState = inject<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);
  private _planArtefactResolver? = inject(PlanArtefactResolverService, { optional: true });
  private _planPersistenceState = inject(PlanEditorPersistenceStateService);
  readonly _planEditService = inject(PlanEditorService);
  readonly _planInteractiveSession? = inject(PlanInteractiveSessionService, { optional: true });

  readonly activeNode = this._treeState.selectedNode;
  readonly activeNodeArtefact = computed(() => this.activeNode()?.originalArtefact);

  /** @Output() **/
  readonly externalObjectDrop = output<DropInfo>();

  @Input() isReadonly: boolean = false;

  @ViewChild('area') splitAreaElementRef?: ElementRef<HTMLElement>;

  @ViewChild(TreeComponent) tree?: TreeComponent<ArtefactTreeNode>;

  protected treeSize = this._planPersistenceState.getPanelSize(TREE_SIZE);
  protected artefactDetailsSize = this._planPersistenceState.getPanelSize(ARTEFACT_DETAILS_SIZE);

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
    setTimeout(() => this._planEditService.handlePlanChange(), 200);
  }

  handleTreeSizeChange(size: number): void {
    this._planPersistenceState.setPanelSize(TREE_SIZE, size);
  }

  handleArtefactDetailsSizeChange(size: number): void {
    this._planPersistenceState.setPanelSize(ARTEFACT_DETAILS_SIZE, size);
  }

  private canOpenArtefact(artefact?: AbstractArtefact): boolean {
    if (!artefact) {
      return false;
    }
    return ['CallPlan', 'CallKeyword'].includes(artefact._class);
  }
}
