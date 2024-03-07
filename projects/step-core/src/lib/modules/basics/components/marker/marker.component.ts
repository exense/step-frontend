import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MarkerType } from '../../types/marker-type.enum';

@Component({
  selector: 'step-marker',
  templateUrl: './marker.component.html',
  styleUrl: './marker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkerComponent {
  readonly MarkerType = MarkerType;
  @Input({ required: true }) color!: string;
  @Input() markerType: MarkerType = MarkerType.SQUARE;
}
