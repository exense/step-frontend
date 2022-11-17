import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { RepositoryObjectReference } from '@exense/step-core';
import { PLAN_EXECUTION_WRAPPER } from '../angularjs/plan-execution-wrapper';

@Directive({
  selector: 'step-plan-execution',
})
export class PlanExecutionDirective extends UpgradeComponent {
  constructor(_elementRef: ElementRef, _injector: Injector) {
    super(PLAN_EXECUTION_WRAPPER, _elementRef, _injector);
  }

  @Input() description?: string;
  @Input() repositoryObjectRef?: RepositoryObjectReference;
}
