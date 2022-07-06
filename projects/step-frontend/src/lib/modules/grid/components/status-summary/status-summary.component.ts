import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TokenGroupCapacity } from '@exense/step-core';

@Component({
  selector: 'step-status-summary',
  templateUrl: './status-summary.component.html',
  styleUrls: ['./status-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusSummaryComponent {
  @Input() tokenGroup?: TokenGroupCapacity;

  constructor() {}
}
