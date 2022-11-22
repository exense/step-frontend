import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Panels } from '../../shared/panels.enum';
import { ExecutionStateService } from '../../services/execution-state.service';
import { ExecutionsPanelsService } from '../../services/executions-panels.service';
import { Observable, of } from 'rxjs';
import { ExecutionStepPanel } from '../../shared/execution-step-panel';
import { Mutable } from '@exense/step-core';
import { SingleExecutionPanelsService } from '../../services/single-execution-panels.service';

type FieldAccessor = Mutable<Pick<PanelComponent, 'panel$'>>;

@Component({
  selector: 'step-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements OnChanges {
  @Input() panelType?: Panels;

  readonly panel$: Observable<ExecutionStepPanel | undefined> = of(undefined);

  constructor(public _state: ExecutionStateService, private _executionPanels: SingleExecutionPanelsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const cPanelType = changes['panelType'];
    if (cPanelType?.previousValue !== cPanelType?.currentValue || cPanelType.firstChange) {
      this.observePanel(cPanelType?.currentValue);
    }
  }

  private observePanel(panelType?: Panels): void {
    (this as FieldAccessor).panel$ = !panelType ? of(undefined) : this._executionPanels.observePanel(panelType);
  }
}
