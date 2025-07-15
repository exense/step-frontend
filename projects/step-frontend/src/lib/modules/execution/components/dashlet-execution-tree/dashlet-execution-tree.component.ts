import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { Panels } from '../../shared/panels.enum';

@Component({
  selector: 'step-dashlet-execution-tree',
  templateUrl: './dashlet-execution-tree.component.html',
  styleUrls: ['./dashlet-execution-tree.component.scss'],
  standalone: false,
})
export class DashletExecutionTreeComponent implements CustomComponent {
  context?: any;
  readonly Panels = Panels;
}
