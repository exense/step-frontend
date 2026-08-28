import {ChangeDetectionStrategy, Component, inject, ViewEncapsulation} from '@angular/core';
import {CustomComponent, StepCoreModule} from '@exense/step-core';
import {IdeStateService} from '../../services/ide-state.service';
import {ApAccessHistoryService} from '../../services/ap-access-history.service';

@Component({
  selector: 'step-ide-header-bar',
  imports: [StepCoreModule],
  templateUrl: './ide-header-bar.component.html',
  styleUrl: './ide-header-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IdeHeaderBarComponent implements CustomComponent {

  protected readonly _ideState = inject(IdeStateService);
  protected readonly _apAccessHistory = inject(ApAccessHistoryService);

  context?: unknown;

}
