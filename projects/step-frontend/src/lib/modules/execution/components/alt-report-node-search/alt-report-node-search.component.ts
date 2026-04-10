import { Component, inject } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';

@Component({
  selector: 'step-alt-report-node-search',
  imports: [StepCoreModule],
  templateUrl: './alt-report-node-search.component.html',
  styleUrl: './alt-report-node-search.component.scss',
})
export class AltReportNodeSearchComponent {
  protected _state = inject(AltReportNodesStateService);
}
