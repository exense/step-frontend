import { Component } from '@angular/core';
import { AlertType, ArtefactContext, CustomComponent } from '@exense/step-core';

@Component({
  selector: 'step-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.scss'],
  standalone: false,
})
export class PlaceholderComponent implements CustomComponent {
  readonly AlertType = AlertType;
  context!: ArtefactContext;
}
