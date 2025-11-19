import { Directive, effect, inject, model } from '@angular/core';
import { PlanEditorPersistenceStateService } from '../../injectables/plan-editor-persistence-state.service';

const TREE_SIZE = 'TREE_SIZE';
const ARTEFACT_DETAILS_SIZE = 'ARTEFACT_DETAILS_SIZE';
const LEFT_PANEL_SIZE = 'LEFT_PANEL_SIZE';
const RIGHT_PANEL_SIZE = 'RIGHT_PANEL_SIZE';

@Directive({
  selector: '[stepPlanTreePanelSizes]',
})
export class PlanTreePanelSizesDirective {
  private _planPersistenceState = inject(PlanEditorPersistenceStateService);

  readonly leftPanelSize = model(this._planPersistenceState.getPanelSize(LEFT_PANEL_SIZE));
  readonly treeSize = model(this._planPersistenceState.getPanelSize(TREE_SIZE));
  readonly artefactDetailsSize = model(this._planPersistenceState.getPanelSize(ARTEFACT_DETAILS_SIZE));
  readonly rightPanelSize = model(this._planPersistenceState.getPanelSize(RIGHT_PANEL_SIZE));

  private effectLeftPanelSizeChange = effect(() => {
    const size = this.leftPanelSize();
    this._planPersistenceState.setPanelSize(LEFT_PANEL_SIZE, size ?? 0);
  });

  private effectTreePanelSizeChange = effect(() => {
    const size = this.treeSize();
    this._planPersistenceState.setPanelSize(TREE_SIZE, size ?? 0);
  });

  private effectArtefactDetailsSizeChange = effect(() => {
    const size = this.artefactDetailsSize();
    this._planPersistenceState.setPanelSize(ARTEFACT_DETAILS_SIZE, size ?? 0);
  });

  private effectRightPanelSizeChange = effect(() => {
    const size = this.rightPanelSize();
    this._planPersistenceState.setPanelSize(RIGHT_PANEL_SIZE, size ?? 0);
  });
}
