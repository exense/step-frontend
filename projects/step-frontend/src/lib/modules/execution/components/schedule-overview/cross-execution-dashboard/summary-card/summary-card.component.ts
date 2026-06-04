import {Component, input} from '@angular/core';

@Component({
  selector: 'step-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss',
  standalone: false
})
export class SummaryCardComponent {
  readonly cardTitle = input<string>();
  readonly value = input<number | string | null | undefined>(undefined);
  readonly inProgress = input(false);
}
