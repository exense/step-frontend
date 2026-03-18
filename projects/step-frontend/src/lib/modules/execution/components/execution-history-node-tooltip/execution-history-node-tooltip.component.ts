import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { STATUS_COLORS, StepBasicsModule } from '@exense/step-core';
import {Status} from "../../../_common/shared/status.enum";

@Component({
  selector: 'step-execution-history-node-tooltip',
  templateUrl: './execution-history-node-tooltip.component.html',
  styleUrls: ['./execution-history-node-tooltip.component.scss'],
  standalone: false,
})
export class ExecutionHistoryNodeTooltipComponent {
  private _statusColors = inject(STATUS_COLORS);
  private _router = inject(Router);

  readonly status = input.required<string>();
  readonly link = input<string>();
  readonly linkLabel = input<string>();

  protected readonly color = computed(() => {
    const status = this.status();
    return (status ? this._statusColors[status as Status] : undefined) ?? this._statusColors['TECHNICAL_ERROR'];
  });

  protected navigateToLink(): void {
    const link = this.link();
    if (link) {
      this._router.navigateByUrl(link);
    }
  }
}
