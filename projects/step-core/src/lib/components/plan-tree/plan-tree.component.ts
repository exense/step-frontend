import {
  Component,
  ElementRef,
  forwardRef,
  inject,
  Input,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { AbstractArtefact } from '../../client/generated';
import {
  ArtefactTreeNode,
  TreeAction,
  TreeActionsService,
  TreeComponent,
  TreeStateService,
} from '../../modules/tree/tree.module';
import { PlanArtefactResolverService } from '../../services/plan-artefact-resolver.service';
import { PlanEditorService } from '../../services/plan-editor.service';
import { PlanInteractiveSessionService } from '../../services/plan-interactive-session.service';
import { PlanTreeAction } from '../../shared/plan-tree-action.enum';

@Component({
  selector: 'step-plan-tree',
  templateUrl: './plan-tree.component.html',
  styleUrls: ['./plan-tree.component.scss'],
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
  readonly _planEditService = inject(PlanEditorService);
  readonly _planInteractiveSession? = inject(PlanInteractiveSessionService, { optional: true });

  readonly selectedArtefact$ = this._treeState.selectedNode$.pipe(map((node) => node?.originalArtefact));
  @Input() isReadonly: boolean = false;

  @ViewChild('area') splitAreaElementRef?: ElementRef<HTMLElement>;

  @ViewChild(TreeComponent) tree?: TreeComponent<ArtefactTreeNode>;

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

  private actionsMultiple: Map<string, string> = new Map<string, string>([
    [ PlanTreeAction.OPEN, 'Open (Ctrl + O)'],
    [ PlanTreeAction.RENAME, 'Rename (F2)'],
    [ PlanTreeAction.ENABLE, 'Enable All Selected (Ctrl + E)'],
    [ PlanTreeAction.DISABLE, 'Disable All Selected (Ctrl + E)'],
    [ PlanTreeAction.COPY, 'Copy All Selected (Ctrl + C)'],
    [ PlanTreeAction.PASTE, 'Paste All Selected (Ctrl + V)'],
    [ PlanTreeAction.DUPLICATE, 'Duplicate All Selected (Ctrl + D)'],
    [ PlanTreeAction.DELETE, 'Delete All Selected (Del)'],
    [ PlanTreeAction.MOVE_UP, 'Move Up All Selected (Ctrl + ⬆️)'],
    [ PlanTreeAction.MOVE_DOWN, 'Move Down All Selected (Ctrl + ⬇️)'],
    [ PlanTreeAction.MOVE_LEFT, 'Move Left All Selected (Ctrl + ⬅️)'],
    [ PlanTreeAction.MOVE_RIGHT, 'Move Right All Selected (Ctrl + ➡️)'],
  ]);

  getActionsForNode(node: ArtefactTreeNode, multipleNodes?: boolean): Observable<TreeAction[]> {
    const isSkipped = node.isSkipped;

    return of(this.actions).pipe(
      map((actions) =>
        actions
          .map((action) => {
            let disabled = false;
            if (this.isReadonly) {
              disabled = true;
            } else if (action.id === PlanTreeAction.OPEN) {
              disabled = !this.canOpenArtefact(node.originalArtefact);
            }
            if (multipleNodes && ((action.id === PlanTreeAction.OPEN) || (action.id === PlanTreeAction.RENAME))) {
              disabled = true;
            }

            const newLabel = multipleNodes ? this.actionsMultiple.get(action.id)! : action.label;

            return { ...action, disabled, label: newLabel };
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
          })
      )
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

  hasActionsForNode(node: ArtefactTreeNode): boolean {
    return true;
  }

  handleDoubleClick(node: ArtefactTreeNode, event: MouseEvent): void {
    if (!this.canOpenArtefact(node.originalArtefact) || !this._planArtefactResolver) {
      return;
    }
    event.preventDefault();
    this._planArtefactResolver.openArtefact(node.originalArtefact);
  }

  proceedAction(actionId: string, node?: ArtefactTreeNode, multipleNodes?: boolean): void {
    const artefact = node?.originalArtefact;
    switch (actionId) {
      case PlanTreeAction.RENAME:
        this._planEditService.rename(artefact);
        break;
      case PlanTreeAction.MOVE_UP:
        this._planEditService.moveUp(multipleNodes ? undefined : artefact);
        break;
      case PlanTreeAction.MOVE_DOWN:
        this._planEditService.moveDown(multipleNodes ? undefined : artefact);
        break;
      case PlanTreeAction.MOVE_LEFT:
        this._planEditService.moveOut(multipleNodes ? undefined : artefact);
        break;
      case PlanTreeAction.MOVE_RIGHT:
        this._planEditService.moveInPrevSibling(multipleNodes ? undefined : artefact);
        break;
      case PlanTreeAction.COPY:
        this._planEditService.copy(multipleNodes ? undefined : artefact);
        break;
      case PlanTreeAction.PASTE:
        this._planEditService.paste(multipleNodes ? undefined : artefact);
        break;
      case PlanTreeAction.DUPLICATE:
        this._planEditService.duplicate(multipleNodes ? undefined : artefact);
        break;
      case PlanTreeAction.DELETE:
        this._planEditService.delete(multipleNodes ? undefined : artefact);
        break;
      case PlanTreeAction.OPEN:
        this._planArtefactResolver?.openArtefact(artefact);
        break;
      case PlanTreeAction.DISABLE:
      case PlanTreeAction.ENABLE:
        this._planEditService?.toggleSkip(multipleNodes ? undefined : artefact, actionId);
        break;
      default:
        break;
    }
  }

  private canOpenArtefact(artefact: AbstractArtefact): boolean {
    return ['CallPlan', 'CallKeyword'].includes(artefact._class);
  }

  handlePlanChange() {
    // Timeout is needed to prevent update issue when clicking into the tree and leaving a property field that triggers
    // a plan change
    setTimeout(() => this._planEditService.handlePlanChange(), 200);
  }
}
