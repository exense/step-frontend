import { Component, EventEmitter, inject, input, Output, ViewEncapsulation } from '@angular/core';
import { ArtefactService, TableIndicatorMode } from '@exense/step-core';

@Component({
  selector: 'step-plan-artefact-list',
  templateUrl: './plan-artefact-list.component.html',
  styleUrls: ['./plan-artefact-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class PlanArtefactListComponent {
  readonly insertTargetName = input<string>();
  readonly availableArtefacts$ = inject(ArtefactService).availableArtefacts$;

  @Output() onSelection = new EventEmitter<string>();

  addControl(id: string): void {
    this.onSelection.emit(id);
  }

  protected readonly TableIndicatorMode = TableIndicatorMode;
}
