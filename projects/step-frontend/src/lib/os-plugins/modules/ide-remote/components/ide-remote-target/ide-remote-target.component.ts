import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IdeRemoteTarget } from '../../services/ide-remote-defaults.service';

@Component({
  selector: 'step-ide-remote-target',
  templateUrl: './ide-remote-target.component.html',
  styleUrl: './ide-remote-target.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdeRemoteTargetComponent {
  readonly label = input('Remote target');
  readonly target = input.required<IdeRemoteTarget>();
}
