import { Component, Input, TrackByFunction } from '@angular/core';
import { CronExclusion, ExecutiontTaskParameters } from '@exense/step-core';

@Component({
  selector: 'step-cron-expression-cell',
  templateUrl: './cron-expression-cell.component.html',
  styleUrls: ['./cron-expression-cell.component.scss'],
  standalone: false,
})
export class CronExpressionCellComponent {
  @Input() task?: ExecutiontTaskParameters;
  readonly trackByExclusion: TrackByFunction<CronExclusion> = (index, item) => item.cronExpression;

  protected isPopoverToggled?: boolean;
}
