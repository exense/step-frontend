import { Component, Input } from '@angular/core';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'step-description-hint',
  templateUrl: './description-hint.component.html',
  styleUrls: ['./description-hint.component.scss'],
  standalone: false,
})
export class DescriptionHintComponent {
  toggleActive = false;
  @Input() description?: string;
  @Input() xPosition: MatMenu['xPosition'] = 'after';
  @Input() yPosition: MatMenu['yPosition'] = 'above';
}
