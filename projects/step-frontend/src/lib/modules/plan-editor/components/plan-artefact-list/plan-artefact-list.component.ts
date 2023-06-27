import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ArtefactService } from '@exense/step-core';

@Component({
  selector: 'step-plan-artefact-list',
  templateUrl: './plan-artefact-list.component.html',
  styleUrls: ['./plan-artefact-list.component.scss'],
})
export class PlanArtefactListComponent {
  readonly availableArtefacts$ = inject(ArtefactService).availableArtefacts$;

  @Output() onSelection = new EventEmitter<string>();

  addControl(id: string): void {
    this.onSelection.emit(id);
  }
}
