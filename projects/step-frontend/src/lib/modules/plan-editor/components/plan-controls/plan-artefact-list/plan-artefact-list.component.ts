import { Component, inject, output, ViewEncapsulation } from '@angular/core';
import { ArtefactService, StepCoreModule, TableIndicatorMode } from '@exense/step-core';
import { ArtefactDropInfoPipe } from './artefact-drop-info.pipe';
import { PlanNodesDragPreviewComponent } from '../../plan-nodes-drag-preview/plan-nodes-drag-preview.component';

@Component({
  selector: 'step-plan-artefact-list',
  templateUrl: './plan-artefact-list.component.html',
  styleUrls: ['./plan-artefact-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [StepCoreModule, ArtefactDropInfoPipe, PlanNodesDragPreviewComponent],
})
export class PlanArtefactListComponent {
  readonly availableArtefacts$ = inject(ArtefactService).availableArtefacts$;

  readonly onSelection = output<string>();

  addControl(id: string): void {
    this.onSelection.emit(id);
  }

  protected readonly TableIndicatorMode = TableIndicatorMode;
}
