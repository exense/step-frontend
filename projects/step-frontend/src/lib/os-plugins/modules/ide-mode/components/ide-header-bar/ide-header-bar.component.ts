import {Component, inject} from '@angular/core';
import {CustomComponent, StepCoreModule} from '@exense/step-core';
import {IdeStateService} from '../../services/ide-state.service';

@Component({
  selector: 'step-ide-header-bar',
  imports: [StepCoreModule],
  templateUrl: './ide-header-bar.component.html',
  styleUrl: './ide-header-bar.component.scss'
})
export class IdeHeaderBarComponent implements CustomComponent {

  protected readonly _ideState = inject(IdeStateService);

  context?: unknown;

}
