import { Component, forwardRef, OnDestroy, OnInit, Optional } from '@angular/core';
import { AbstractArtefact, CustomComponent, TreeAction, TreeActionsService } from '@exense/step-core';
import { map, Observable, of, Subject } from 'rxjs';
import { PlanHandleService } from '../../services/plan-handle.service';
import { PlanTreeAction } from '../../shared/plan-tree-action.enum';
import { ArtefactTreeNode } from '../../shared/artefact-tree-node';

@Component({
  selector: 'step-plan-tree',
  templateUrl: './plan-tree.component.html',
  styleUrls: ['./plan-tree.component.scss'],
  providers: [
    {
      provide: TreeActionsService,
      useExisting: forwardRef(() => PlanTreeComponent),
    },
  ],
})
export class PlanTreeComponent implements OnInit, OnDestroy, CustomComponent, TreeActionsService {
  context?: any;

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

  private terminator$ = new Subject<unknown>();

  constructor(@Optional() public _planHandle?: PlanHandleService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.terminator$.next({});
    this.terminator$.complete();
  }

  getActionsForNode(node: ArtefactTreeNode): Observable<TreeAction[]> {
    const isSkipped = node.isSkipped;

    return of(this.actions).pipe(
      map((actions) =>
        actions
          .map((action) => {
            let disabled = false;
            if (action.id === PlanTreeAction.open) {
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
        this._planHandle?.rename(node);
        break;
      case PlanTreeAction.move_up:
        this._planHandle?.moveUp(node);
        break;
      case PlanTreeAction.move_down:
        this._planHandle?.moveDown(node);
        break;
      case PlanTreeAction.copy:
        this._planHandle?.copy(node);
        break;
      case PlanTreeAction.paste:
        this._planHandle?.paste(node);
        break;
      case PlanTreeAction.delete:
        this._planHandle?.delete(node);
        break;
      case PlanTreeAction.open:
        this._planHandle?.openArtefact(node);
        break;
      case PlanTreeAction.disable:
      case PlanTreeAction.enable:
        this._planHandle?.toggleSkip(node);
        break;
      default:
        break;
    }
  }
}
