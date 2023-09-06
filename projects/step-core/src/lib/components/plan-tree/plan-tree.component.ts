import { Component, ElementRef, forwardRef, Input, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { AbstractArtefact } from '../../client/generated';
import { ArtefactTreeNode, TreeAction, TreeActionsService, TreeStateService } from '../../modules/tree/tree.module';
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
  readonly selectedArtefact$ = this._treeState.selectedNode$.pipe(map((node) => node?.originalArtefact));
  @Input() isReadonly: boolean = false;

  @ViewChild('area') splitAreaElementRef?: ElementRef<HTMLElement>;

  private actions: TreeAction[] = [
    { id: PlanTreeAction.RENAME, label: 'Rename (F2)' },
    { id: PlanTreeAction.MOVE_UP, label: 'Move Up (Ctrl + ⬆️)' },
    { id: PlanTreeAction.MOVE_DOWN, label: 'Move Down (Ctrl + ⬇️)' },
    { id: PlanTreeAction.MOVE_LEFT, label: 'Move Left (Ctrl + ⬅️)' },
    { id: PlanTreeAction.MOVE_RIGHT, label: 'Move Right (Ctrl + ➡️)' },
    { id: PlanTreeAction.COPY, label: 'Copy (Ctrl + C)' },
    { id: PlanTreeAction.PASTE, label: 'Paste (Ctrl + V)' },
    { id: PlanTreeAction.DELETE, label: 'Delete (Del)' },
    { id: PlanTreeAction.OPEN, label: 'Open (Ctrl + O)' },
    { id: PlanTreeAction.ENABLE, label: 'Enable (Ctrl + E)' },
    { id: PlanTreeAction.DISABLE, label: 'Disable (Ctrl + E)' },
  ];

  constructor(
    private _treeState: TreeStateService<AbstractArtefact, ArtefactTreeNode>,
    public _planEditService: PlanEditorService,
    @Optional() public _planInteractiveSession?: PlanInteractiveSessionService,
    @Optional() private _planArtefactResolver?: PlanArtefactResolverService
  ) {}

  getActionsForNode(node: ArtefactTreeNode): Observable<TreeAction[]> {
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
            return { ...action, disabled };
          })
          .filter((action) => {
            if (action.id === PlanTreeAction.DISABLE && isSkipped) {
              return false;
            }

            if (action.id === PlanTreeAction.ENABLE && !isSkipped) {
              return false;
            }

            return true;
          })
      )
    );
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

  proceedAction(actionId: string, node?: ArtefactTreeNode): void {
    const artefact = node?.originalArtefact;
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
      case PlanTreeAction.DELETE:
        this._planEditService.delete(artefact);
        break;
      case PlanTreeAction.OPEN:
        this._planArtefactResolver?.openArtefact(artefact);
        break;
      case PlanTreeAction.DISABLE:
      case PlanTreeAction.ENABLE:
        this._planEditService?.toggleSkip(artefact);
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
