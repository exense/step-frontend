import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'step-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent {
  @Input() progress$!: Observable<number>;
}
