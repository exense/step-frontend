import { Component, forwardRef, Input, Optional, ViewEncapsulation } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { PlanTreeAction } from '../../shared/plan-tree-action.enum';
import { PlanEditorService } from '../../services/plan-editor.service';
import { TreeStateService, TreeAction, TreeActionsService, ArtefactTreeNode } from '../../modules/tree/tree.module';
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
              disabled = !this.canOpenArtefact(node.originalArtefact);
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
      case PlanTreeAction.rename:
        this._planEditService.rename(artefact);
        break;
      case PlanTreeAction.move_up:
        this._planEditService.moveUp(artefact);
        break;
      case PlanTreeAction.move_down:
        this._planEditService.moveDown(artefact);
        break;
      case PlanTreeAction.copy:
        this._planEditService.copy(artefact);
        break;
      case PlanTreeAction.paste:
        this._planEditService.paste(artefact);
        break;
      case PlanTreeAction.delete:
        this._planEditService.delete(artefact);
        break;
      case PlanTreeAction.open:
        this._planArtefactResolver?.openArtefact(artefact);
        break;
      case PlanTreeAction.disable:
      case PlanTreeAction.enable:
        this._planEditService?.toggleSkip(artefact);
        break;
      default:
        break;
    }
  }

  private canOpenArtefact(artefact: AbstractArtefact): boolean {
    return ['CallPlan', 'CallKeyword'].includes(artefact._class);
  }
}
