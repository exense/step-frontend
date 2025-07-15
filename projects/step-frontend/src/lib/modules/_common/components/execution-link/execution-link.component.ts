import { Component, inject, Input, OnInit } from '@angular/core';
import { Execution, ExecutionsService } from '@exense/step-core';

@Component({
  selector: 'step-execution-link',
  templateUrl: './execution-link.component.html',
  styleUrls: ['./execution-link.component.scss'],
  standalone: false,
})
export class ExecutionLinkComponent implements OnInit {
  private _executionService = inject(ExecutionsService);

  @Input() executionId?: string;
  @Input() executionDescription?: string;

  ngOnInit(): void {
    if (this.executionId && !this.executionDescription) {
      this._executionService.getExecutionById(this.executionId!).subscribe((ex: Execution) => {
        this.executionDescription = ex?.description;
      });
    }
  }
}
