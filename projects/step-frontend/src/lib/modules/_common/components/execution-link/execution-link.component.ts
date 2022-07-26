import { Component, Input, OnInit } from '@angular/core';
import { Execution, ExecutionsService } from '@exense/step-core';

@Component({
  selector: 'step-execution-link',
  templateUrl: './execution-link.component.html',
  styleUrls: ['./execution-link.component.scss'],
})
export class ExecutionLinkComponent implements OnInit {
  @Input() executionId?: string;
  @Input() executionDescription?: string;

  constructor(private _executionService: ExecutionsService) {}

  ngOnInit(): void {
    if (this.executionId && !this.executionDescription) {
      this._executionService.get3(this.executionId!).subscribe((ex: Execution) => {
        this.executionDescription = ex?.description;
      });
    }
  }
}
