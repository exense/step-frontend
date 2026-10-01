import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { CustomComponent, StepCoreModule } from '@exense/step-core';
import { ApAccessHistoryService } from '../../services/ap-access-history.service';
import { IdeStateService } from '../../services/ide-state.service';

@Component({
  selector: 'step-ide-empty-state',
  imports: [StepCoreModule],
  templateUrl: './ide-empty-state.component.html',
  styleUrl: './ide-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class IdeEmptyStateComponent implements CustomComponent {
  protected readonly _ideState = inject(IdeStateService);
  protected readonly recentPackages = inject(ApAccessHistoryService).history;

  context?: unknown;
}
