import { Component, inject } from '@angular/core';
import { AlertsService } from '../../services/alerts.service';

@Component({
  selector: 'step-alerts-container',
  templateUrl: './alerts-container.component.html',
  styleUrl: './alerts-container.component.scss',
})
export class AlertsContainerComponent {
  readonly _alerts = inject(AlertsService).alerts;
}
