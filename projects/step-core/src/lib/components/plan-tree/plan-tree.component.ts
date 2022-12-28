import { Component, forwardRef, Input, Optional, ViewEncapsulation } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { ArtefactTreeNode } from '../../shared/artefact-tree-node';
import { PlanTreeAction } from '../../shared/plan-tree-action.enum';
import { PlanEditorService } from '../../services/plan-editor.service';
import { TreeActionsService } from '../../modules/tree/services/tree-actions.service';
import { TreeAction } from '../../modules/tree/shared/tree-action';
import { TreeStateService } from '../../modules/tree/services/tree-state.service';
import { AbstractArtefact } from '../../client/generated';
import { PlanInteractiveSessionService } from '../../services/plan-interactive-session.service';
import { PlanArtefactResolverService } from '../../services/plan-artefact-resolver.service';

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

  private actions: TreeAction[] = [
    { id: PlanTreeAction.rename, label: 'Rename (F2)' },
    { id: PlanTreeAction.move_up, label: 'Move Up (Ctrl+Up)' },
    { id: PlanTreeAction.move_down, label: 'Move Down (Ctrl+Down)' },
    { id: PlanTreeAction.copy, label: 'Copy (Ctrl+c)' },
    { id: PlanTreeAction.paste, label: 'Paste (Ctrl+v)' },
    { id: PlanTreeAction.delete, label: 'Delete (Del)' },
    { id: PlanTreeAction.open, label: 'Open (Ctrl+o)' },
    { id: PlanTreeAction.enable, label: 'Enable (Ctrl+e)' },
    { id: PlanTreeAction.disable, label: 'Disable (Ctrl+e)' },
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
            } else if (action.id === PlanTreeAction.open) {
              disabled = !['CallPlan', 'CallKeyword'].includes(node.originalArtefact._class);
            }
            return { ...action, disabled };
          })
          .filter((action) => {
            if (action.id === PlanTreeAction.disable && isSkipped) {
              return false;
            }

            if (action.id === PlanTreeAction.enable && !isSkipped) {
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

  proceedAction(actionId: string, node?: AbstractArtefact): void {
    switch (actionId) {
      case PlanTreeAction.rename:
        this._planEditService.rename(node);
        break;
      case PlanTreeAction.move_up:
        this._planEditService.moveUp(node);
        break;
      case PlanTreeAction.move_down:
        this._planEditService.moveDown(node);
        break;
      case PlanTreeAction.copy:
        this._planEditService.copy(node);
        break;
      case PlanTreeAction.paste:
        this._planEditService.paste(node);
        break;
      case PlanTreeAction.delete:
        this._planEditService.delete(node);
        break;
      case PlanTreeAction.open:
        this._planArtefactResolver?.openArtefact(node);
        break;
      case PlanTreeAction.disable:
      case PlanTreeAction.enable:
        this._planEditService?.toggleSkip(node);
        break;
      default:
        break;
    }
  }
}
