import { Component, Input, OnChanges } from '@angular/core';
import { Execution, ExecutionsService } from '@exense/step-core';

@Component({
  selector: 'step-execution-link',
  templateUrl: './execution-link.component.html',
  styleUrls: ['./execution-link.component.scss'],
})
export class ExecutionLinkComponent implements OnChanges {
  @Input() executionId?: string;
  @Input() executionDescription?: string;

  constructor(private _executionService: ExecutionsService) {}

  ngOnChanges(): void {
    if (this.executionId && !this.executionDescription) {
      this._executionService.get3(this.executionId!).subscribe((ex: Execution) => {
        this.executionDescription = ex?.description;
      });
    }
  }
}
